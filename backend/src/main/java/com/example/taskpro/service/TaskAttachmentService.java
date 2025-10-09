package com.example.taskpro.service;

import com.example.taskpro.dto.taskAttachment.TaskAttachmentBasicDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.TaskAttachment;
import com.example.taskpro.model.User;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.mapper.TaskAttachmentMapper;
import com.example.taskpro.repository.TaskAttachmentRepository;
import com.example.taskpro.repository.TaskRepository;
import com.example.taskpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.example.taskpro.util.SecurityUtil.authorizeTaskAccess;
import static com.example.taskpro.util.SecurityUtil.getConnectedUser;

@Service
@RequiredArgsConstructor
public class TaskAttachmentService {

    private final TaskAttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskAttachmentMapper attachmentMapper;
    private final FileStorageService fileStorageService;
    private final FileValidationService fileValidationService;
    private final AuditService auditService;
    private final MessageService messageService;

    /**
     * Ajoute une pièce jointe à une tâche
     */
    @Transactional
    public TaskAttachmentBasicDTO addAttachment(Long taskId, MultipartFile file, Authentication authentication) throws IOException {
        User uploader = getConnectedUser(authentication, userRepository);
                
        Task task = findTaskOrThrow(taskId);

        authorizeTaskAccess(task, uploader,
                "You don't have permission to upload file to this task. " +
                        "Contact the project owner or the project members to add you to the project.");

        // Valider le fichier
        String validationError = fileValidationService.validateFile(file);
        if (validationError != null) {
            throw new IllegalArgumentException(validationError);
        }


        // Stocker le fichier
        String fileName = fileStorageService.storeFile(file);
        String fileType = file.getContentType();
        long fileSize = file.getSize();
        
        // Créer l'entité d'attachement
        TaskAttachment attachment = new TaskAttachment();
        attachment.setTask(task);
        attachment.setUploader(uploader);
        attachment.setFileName(fileName);
        attachment.setFileType(fileType);
        attachment.setFileSize(fileSize);
        attachment.setUploadedAt(LocalDateTime.now());
        
        TaskAttachment savedAttachment = attachmentRepository.save(attachment);
        return attachmentMapper.toBasicDto(savedAttachment);
    }
    
    /**
     * Récupère une pièce jointe par son ID
     */
    @Transactional(readOnly = true)
    public TaskAttachmentBasicDTO getAttachmentById(Long attachmentId, Authentication authentication) {
        User user = getConnectedUser(authentication, userRepository);
        TaskAttachment attachment = findAttachmentOrThrow(attachmentId);

        // Vérifier si l'utilisateur a accès à cette pièce jointe
        boolean hasAccess = attachment.getTask().getProject().getMembers().contains(user) || 
                            attachment.getTask().getProject().getOwner().equals(user);
        
        if (!hasAccess) {
            throw new OperationNotPermittedException("You don't have permission to view this attachment");
        }
        
        return attachmentMapper.toBasicDto(attachment);
    }
    
    /**
     * Récupère toutes les pièces jointes d'une tâche
     */
    @Transactional(readOnly = true)
    public List<TaskAttachmentBasicDTO> getAttachmentsByTaskId(Long taskId, Authentication authentication) {
        User user = getConnectedUser(authentication, userRepository);
        Task task = findTaskOrThrow(taskId);

        // Vérifier si l'utilisateur a accès à cette tâche
        authorizeTaskAccess(task, user, "You don't have permission to view attachments on this task");
        
        List<TaskAttachment> attachments = attachmentRepository.findByTaskId(taskId);
        return attachments.stream()
                .map(attachmentMapper::toBasicDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Supprime une pièce jointe
     */
    @Transactional
    public void deleteAttachment(Long attachmentId, Authentication authentication) {
        User user = getConnectedUser(authentication, userRepository);
        TaskAttachment attachment = findAttachmentOrThrow(attachmentId);

        // Vérifier si l'utilisateur est autorisé à supprimer cette pièce jointe
        boolean isUploader = attachment.getUploader().equals(user);
        boolean isProjectOwner = attachment.getTask().getProject().getOwner().equals(user);
        boolean isTaskAssignee = attachment.getTask().getAssignee() != null && 
                                attachment.getTask().getAssignee().equals(user);
        
        if (!isUploader && !isProjectOwner && !isTaskAssignee) {
            throw new OperationNotPermittedException("You don't have permission to delete file to this task.");
        }

        auditService.audit(
                "TaskAttachment",
                attachmentId,
                "DELETE",
                user,
                "File deleted: " + attachment.getFileName() + " from task " + attachment.getTask().getId()
        );


        // Supprimer le fichier physique
        fileStorageService.deleteFile(attachment.getFileName());
        
        // Supprimer l'entrée de la base de données
        attachmentRepository.delete(attachment);
    }
    
    /**
     * Télécharge une pièce jointe (retourne les données du fichier)
     */
    @Transactional(readOnly = true)
    public byte[] downloadAttachment(Long attachmentId, Authentication authentication) throws IOException {
        User user = getConnectedUser(authentication, userRepository);
        TaskAttachment attachment = findAttachmentOrThrow(attachmentId);

        boolean hasAccess = attachment.getTask().getProject().getMembers().contains(user) ||
                            attachment.getTask().getProject().getOwner().equals(user);
        
        if (!hasAccess) {
            throw new OperationNotPermittedException("You don't have permission to download this file.");
        }
        
        return fileStorageService.loadFile(attachment.getFileName());
    }

    private TaskAttachment findAttachmentOrThrow(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with ID: " + attachmentId));
    }

    private Task findTaskOrThrow(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("task.not.found", taskId)
                ));
    }
}