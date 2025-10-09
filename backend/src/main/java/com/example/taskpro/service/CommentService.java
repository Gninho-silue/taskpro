package com.example.taskpro.service;

import com.example.taskpro.dto.comment.CommentBasicDTO;
import com.example.taskpro.dto.comment.CommentCreateDTO;
import com.example.taskpro.dto.comment.CommentDetailDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.mapper.CommentMapper;
import com.example.taskpro.model.Comment;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.CommentRepository;
import com.example.taskpro.repository.TaskRepository;
import com.example.taskpro.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.example.taskpro.util.SecurityUtil.authorizeTaskAccess;
import static com.example.taskpro.util.SecurityUtil.getConnectedUser;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    /**
     * Convertit un commentaire en DTO détaillé
     */
    public CommentDetailDTO toCommentDetail(Comment comment) {
        if (comment == null) return null;
        CommentDetailDTO dto = new CommentDetailDTO();
        BeanUtils.copyProperties(commentMapper.toBasicDto(comment), dto);
        dto.setTaskId(comment.getTask().getId());
        if (comment.getParentComment() != null) {
            dto.setParentCommentId(comment.getParentComment().getId());
        }
        
        // Utiliser une copie défensive pour éviter ConcurrentModificationException
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            Set<CommentBasicDTO> repliesCopy = new HashSet<>(comment.getReplies()).stream()
                    .map(commentMapper::toBasicDto)
                    .collect(Collectors.toSet());
            dto.setReplies(repliesCopy);
        }
        
        return dto;
    }

    /**
     * Crée un nouveau commentaire pour une tâche
     */
    public CommentDetailDTO createComment(Long taskId, CommentCreateDTO dto, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Task task = findTaskOrThrow(taskId);
        
        // Vérifier si l'utilisateur a accès à cette tâche
        authorizeTaskAccess(task, connectedUser, "You don't have permission to comment on this task");
        
        Comment comment = Comment.builder()
                .content(dto.getContent())
                .task(task)
                .user(connectedUser)
                .replies(new HashSet<>())
                .build();
        
        return toCommentDetail(commentRepository.save(comment));
    }
    
    /**
     * Répond à un commentaire existant
     */
    public CommentDetailDTO replyToComment(Long commentId, CommentCreateDTO dto, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Comment parentComment = findCommentOrThrow(commentId);
        Task task = parentComment.getTask();
        authorizeTaskAccess(task, connectedUser, "You don't have permission to reply comment on this task");
        
        Comment reply = Comment.builder()
                .content(dto.getContent())
                .task(task)
                .user(connectedUser)
                .parentComment(parentComment)
                .replies(new HashSet<>())
                .build();
        
        parentComment.getReplies().add(reply);
        
        return toCommentDetail(commentRepository.save(reply));
    }
    
    /**
     * Récupère un commentaire par son ID
     */
    public CommentDetailDTO getCommentById(Long id, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Comment comment = findCommentOrThrow(id);
        Task task = comment.getTask();
        authorizeTaskAccess(task, connectedUser, "You don't have permission to view this comment");
        return toCommentDetail(comment);
    }
    
    /**
     * Récupère tous les commentaires d'une tâche (seulement les commentaires principaux, pas les réponses)
     */
    public List<CommentBasicDTO> getCommentsByTask(Long taskId, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Task task = findTaskOrThrow(taskId);
        
        authorizeTaskAccess(task, connectedUser, "You don't have permission to view comments on this task");
        
        // Récupérer uniquement les commentaires principaux (sans parents)
        return commentRepository.findByTaskIdAndParentCommentIsNull(taskId).stream()
                .map(commentMapper::toBasicDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Met à jour un commentaire existant
     */
    public CommentBasicDTO updateComment(Long id, CommentCreateDTO dto, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Comment comment = findCommentOrThrow(id);
        
        // Seul l'auteur du commentaire peut le modifier
        if (!comment.getUser().equals(connectedUser)) {
            throw new OperationNotPermittedException("You don't have permission to update this comment");
        }
        
        comment.setContent(dto.getContent());
        
        return commentMapper.toBasicDto(commentRepository.save(comment));
    }
    
    /**
     * Supprime un commentaire
     */
    public void deleteComment(Long id, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Comment comment = findCommentOrThrow(id);
        
        // Seul l'auteur du commentaire ou le créateur/assigné de la tâche peut supprimer
        Task task = comment.getTask();
        boolean isTaskOwner = task.getCreator().equals(connectedUser) || 
                (task.getAssignee() != null && task.getAssignee().equals(connectedUser));
                
        if (!comment.getUser().equals(connectedUser) && !isTaskOwner) {
            throw new OperationNotPermittedException("You don't have permission to delete this comment");
        }
        
        // Si c'est un commentaire parent, supprimer aussi toutes les réponses
        if (comment.getParentComment() == null) {
            // Supprimer d'abord toutes les réponses
            commentRepository.deleteAll(comment.getReplies());
        } else {
            // Si c'est une réponse, retirer du parent
            Comment parent = comment.getParentComment();
            parent.getReplies().remove(comment);
            commentRepository.save(parent);
        }
        
        commentRepository.delete(comment);
    }
    
    /**
     * Récupère toutes les réponses d'un commentaire
     */
    public List<CommentBasicDTO> getCommentReplies(Long commentId, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Comment comment = findCommentOrThrow(commentId);
        
        Task task = comment.getTask();
        authorizeTaskAccess(task, connectedUser, "You don't have permission to view comment's replies on this task");
        
        return commentRepository.findByParentCommentId(commentId).stream()
                .map(commentMapper::toBasicDto)
                .collect(Collectors.toList());
    }

    // === HELPERS ===
    
    private Comment findCommentOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id ));
    }
    
    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }
    

}