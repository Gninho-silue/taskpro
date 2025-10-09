package com.example.taskpro.controller;

import com.example.taskpro.dto.notification.NotificationBasicDTO;
import com.example.taskpro.dto.notification.NotificationCreateDTO;
import com.example.taskpro.dto.notification.NotificationDetailDTO;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.service.NotificationService;
import com.example.taskpro.util.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("notifications")
@RequiredArgsConstructor
public class NotificationController extends BaseController {

    private final NotificationService notificationService;

    /**
     * Récupère toutes les notifications de l'utilisateur connecté
     */
    @GetMapping
    public ResponseEntity<SuccessResponse> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean onlyUnread,
            Authentication authentication
    ) {
        PageResponse<NotificationBasicDTO> notifications = 
                notificationService.getUserNotifications(page, size, onlyUnread, authentication);
        return okResponse(notifications, "Nofitifications retrieved successfully.");
    }

    /**
     * Récupère une notification par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse> getNotificationById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        NotificationDetailDTO notification = notificationService.getNotificationById(id, authentication);
        return okResponse(notification, "Notification fetched successfully.");
    }

    /**
     * Marque une notification comme lue
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<SuccessResponse> markNotificationAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        NotificationBasicDTO notification = notificationService.markNotificationAsRead(id, authentication);
        return okResponse(notification, "Notification has been marked as read.");
    }

    /**
     * Marque toutes les notifications de l'utilisateur comme lues
     */
    @PutMapping("/read-all")
    public ResponseEntity<SuccessResponse> markAllNotificationsAsRead(
            Authentication authentication
    ) {
        notificationService.markAllNotificationsAsRead(authentication);
        return okResponse(null, "Nofications have been marked as read.");
    }

    /**
     * Récupère les notifications récentes depuis une date donnée
     */
    @GetMapping("/recent")
    public ResponseEntity<SuccessResponse> getRecentNotifications(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            Authentication authentication
    ) {
        List<NotificationBasicDTO> notifications = notificationService.getRecentNotifications(since, authentication);
        return okResponse(notifications, "Notifications récentes récupérées avec succès");
    }


    /**
     * Supprime une notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<SuccessResponse> deleteNotification(
            @PathVariable Long id,
            Authentication authentication
    ) {
        notificationService.deleteNotification(id, authentication);
        return okResponse(null, "Notification has been deleted successfully.");
    }

    /**
     * Supprime toutes les notifications de l'utilisateur
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<SuccessResponse> clearAllNotifications(
            Authentication authentication
    ) {
        notificationService.clearAllNotifications(authentication);
        return okResponse(null, "Notifications have been cleared successfully.");
    }

    /**
     * Récupère le nombre de notifications non lues
     */
    @GetMapping("/count-unread")
    public ResponseEntity<SuccessResponse> countUnreadNotifications(
            Authentication authentication
    ) {
        Long count = notificationService.countUnreadNotifications(authentication);
        return okResponse(count, "Number of unread notifications retrieved successfully.");
    }

    /**
     * Crée une notification pour une tâche
     */
//    @PostMapping("/task")
//    public ResponseEntity<SuccessResponse> createTaskNotification(
//            @RequestBody @Valid NotificationCreateDTO dto,
//            Authentication authentication
//    ) {
//        NotificationBasicDTO notification = notificationService.createTaskNotification(dto, authentication);
//        return createdResponse(notification, "Notification has been created successfully.");
//    }
//
//    @PostMapping("/project")
//    public ResponseEntity<SuccessResponse> createProjectNotification(
//            @RequestBody @Valid NotificationCreateDTO dto,
//            Authentication authentication
//    ) {
//        NotificationBasicDTO notification = notificationService.createProjectNotification(dto, authentication);
//        return createdResponse(notification, "Notification has been created successfully.");
//    }

    @PostMapping
    public ResponseEntity<SuccessResponse> createNotification(
            @RequestBody @Valid NotificationCreateDTO dto,
            Authentication authentication
    ) {
        NotificationBasicDTO notification = notificationService.createNotification(dto, authentication);
        return createdResponse(notification, "Notification has been created successfully.");
    }

}