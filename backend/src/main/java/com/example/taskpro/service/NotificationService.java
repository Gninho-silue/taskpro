package com.example.taskpro.service;

import com.example.taskpro.dto.notification.NotificationBasicDTO;
import com.example.taskpro.dto.notification.NotificationCreateDTO;
import com.example.taskpro.dto.notification.NotificationDetailDTO;
import com.example.taskpro.dto.notification.NotificationWSDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.util.PageResponse;
import com.example.taskpro.mapper.NotificationMapper;
import com.example.taskpro.model.*;
import com.example.taskpro.repository.NotificationRepository;
import com.example.taskpro.repository.ProjectRepository;
import com.example.taskpro.repository.TaskRepository;
import com.example.taskpro.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.example.taskpro.util.PaginationUtil.buildPageResponse;
import static com.example.taskpro.util.SecurityUtil.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketService webSocketService;



    /**
     * Récupère toutes les notifications de l'utilisateur connecté
     */
    public PageResponse<NotificationBasicDTO> getUserNotifications(
            int page,
            int size,
            boolean onlyUnread,
            Authentication authentication
    ) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Pageable pageable = PageRequest.of(page, size, Sort.by("sentAt").descending());
        
        Page<Notification> notifications;
        if (onlyUnread) {
            notifications = notificationRepository.findByUserIdAndReadFalse(connectedUser.getId(), pageable);
        } else {
            notifications = notificationRepository.findByUserId(connectedUser.getId(), pageable);
        }

        Page<NotificationBasicDTO> dtoPage = notifications.map(notificationMapper::toBasicDto);
        return buildPageResponse(dtoPage);
    }
    
    /**
     * Récupère une notification par son ID
     */
    public NotificationDetailDTO getNotificationById(Long id, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Notification notification = findNotificationOrThrow(id);
        
        if (!notification.getUser().getId().equals(connectedUser.getId())) {
            throw new OperationNotPermittedException("You don't have permission to view this notification");
        }
        
        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }
        
        return notificationMapper.toNotificationDetail(notification);
    }

    /**
     * Récupère les notifications récentes depuis une date donnée
     */
    public List<NotificationBasicDTO> getRecentNotifications(LocalDateTime since, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);

        if (since == null) {
            since = LocalDateTime.now().minusHours(24); // Par défaut, dernières 24 heures
        }

        return notificationRepository.findByUserIdAndSentAtAfterOrderBySentAtDesc(connectedUser.getId(), since)
                .stream()
                .map(notificationMapper::toBasicDto)
                .collect(Collectors.toList());
    }
    /**
     * Marque une notification comme lue
     */
    public NotificationBasicDTO markNotificationAsRead(Long id, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Notification notification = findNotificationOrThrow(id);
        if (!notification.getUser().getId().equals(connectedUser.getId())) {
            throw new OperationNotPermittedException("You don't have permission to access this notification");
        }
        
        notification.setRead(true);
        return notificationMapper.toBasicDto(notificationRepository.save(notification));
    }
    
    /**
     * Marque toutes les notifications de l'utilisateur comme lues
     */
    public void markAllNotificationsAsRead(Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        notificationRepository.markAllAsRead(connectedUser.getId());
    }
    
    /**
     * Supprime une notification
     */
    public void deleteNotification(Long id, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Notification notification = findNotificationOrThrow(id);
        
        // Vérifier que la notification appartient à l'utilisateur connecté
        if (!notification.getUser().getId().equals(connectedUser.getId())) {
            throw new OperationNotPermittedException("Vous n'avez pas accès à cette notification");
        }
        
        notificationRepository.delete(notification);
    }
    
    /**
     * Supprime toutes les notifications de l'utilisateur
     */
    public void clearAllNotifications(Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        notificationRepository.deleteByUserId(connectedUser.getId());
    }
    
    /**
     * Récupère le nombre de notifications non lues
     */
    public Long countUnreadNotifications(Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        return notificationRepository.countByUserIdAndReadFalse(connectedUser.getId());
    }

    /**
     * Méthode unifiée pour créer tous types de notifications
     * Cette méthode gère la création de notifications simples, liées à des tâches ou liées à des projets
     */
    public NotificationBasicDTO createNotification(NotificationCreateDTO dto, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);

        if (dto.getRecipientUserId() == null) {
            dto.setRecipientUserId(connectedUser.getId());
        }

        if (dto.getRelatedTaskId() != null) {
            Task task = taskRepository.findById(dto.getRelatedTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + dto.getRelatedTaskId()));
            authorizeTaskAccess(task, connectedUser, "You don't have permission to access this task");
        }

        if (dto.getRelatedProjectId() != null) {
            Project project = projectRepository.findById(dto.getRelatedProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getRelatedProjectId()));
            authorizeProjectAccess(project, connectedUser);
        }

        // Créer la notification
        return createNotificationInternal(dto);
    }

    /**
     * Méthode interne pour créer une notification avec tous les paramètres possibles
     * Renommée pour éviter la confusion avec la méthode publique
     */
    private NotificationBasicDTO createNotificationInternal(NotificationCreateDTO dto) {
        User user = userRepository.findById(dto.getRecipientUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getRecipientUserId()));

        Project project = null;
        if (dto.getRelatedProjectId() != null) {
            project = projectRepository.findById(dto.getRelatedProjectId()).orElse(null);
        }

        Task task = null;
        if (dto.getRelatedTaskId() != null) {
            task = taskRepository.findById(dto.getRelatedTaskId()).orElse(null);
        }

        Notification notification = Notification.builder()
                .message(dto.getMessage())
                .type(dto.getType())
                .read(false)
                .sentAt(LocalDateTime.now())
                .user(user)
                .relatedTask(task)
                .relatedProject(project)
                .build();

        notification = notificationRepository.save(notification);

        if (webSocketService.isUserConnected(user.getId())) {
            sendRealTimeNotification(notification);
        }

        return notificationMapper.toBasicDto(notification);
    }


    /**
     * Envoie une notification en temps réel
     */
    private void sendRealTimeNotification(Notification notification) {
        NotificationWSDTO wsDto = createWebSocketDTO(notification);

        // Envoyer à un canal spécifique pour l'utilisateur
        messagingTemplate.convertAndSend(
                "/queue/notifications/" + notification.getUser().getId(),
                wsDto
        );

        log.info("Notification WebSocket envoyée à l'utilisateur {}", notification.getUser().getId());
    }

    /**
     * Crée un DTO pour WebSocket à partir d'une notification
     */
    private NotificationWSDTO createWebSocketDTO(Notification notification) {
        NotificationWSDTO dto = NotificationWSDTO.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .sentAt(notification.getSentAt())
                .type(notification.getType())
                .userId(notification.getUser().getId())
                .build();

        if (notification.getRelatedTask() != null) {
            Task task = notification.getRelatedTask();
            dto.setTaskId(task.getId());
            dto.setTaskTitle(task.getTitle());
        }

        if (notification.getRelatedProject() != null) {
            Project project = notification.getRelatedProject();
            dto.setProjectId(project.getId());
            dto.setProjectName(project.getName());
        }

        return dto;
    }

    // === HELPERS ===

    private Notification findNotificationOrThrow(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée avec l'id: " + id));
    }

}