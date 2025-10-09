package com.example.taskpro.controller;

import com.example.taskpro.dto.comment.CommentBasicDTO;
import com.example.taskpro.dto.comment.CommentCreateDTO;
import com.example.taskpro.dto.comment.CommentDetailDTO;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("comments")
@RequiredArgsConstructor
public class CommentController extends BaseController {

    private final CommentService commentService;

    /**
     * Crée un nouveau commentaire pour une tâche
     */
    @PostMapping("/tasks/{task-id}")
    public ResponseEntity<SuccessResponse> createComment(
            @PathVariable("task-id") Long taskId,
            @RequestBody @Valid CommentCreateDTO dto,
            Authentication authentication
    ) {
        CommentDetailDTO comment = commentService.createComment(taskId, dto, authentication);
        return createdResponse(comment, "Comment created successfully.");
    }

    /**
     * Crée une réponse à un commentaire existant
     */
    @PostMapping("/{comment-id}/reply")
    public ResponseEntity<SuccessResponse> replyToComment(
            @PathVariable("comment-id") Long commentId,
            @RequestBody @Valid CommentCreateDTO dto,
            Authentication authentication
    ) {
        CommentDetailDTO reply = commentService.replyToComment(commentId, dto, authentication);
        return createdResponse(reply, "Comment response has been created successfully.");
    }

    /**
     * Récupère un commentaire par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse> getCommentById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        CommentDetailDTO comment = commentService.getCommentById(id, authentication);
        return okResponse(comment, "Comment fetched successfully");
    }

    /**
     * Récupère tous les commentaires d'une tâche
     */
    @GetMapping("/tasks/{task-id}")
    public ResponseEntity<SuccessResponse> getCommentsByTask(
            @PathVariable("task-id") Long taskId,
            Authentication authentication
    ) {
        List<CommentBasicDTO> comments = commentService.getCommentsByTask(taskId, authentication);
        return okResponse(comments, "Comments successfully fetched.");
    }

    /**
     * Met à jour un commentaire existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<SuccessResponse> updateComment(
            @PathVariable Long id,
            @RequestBody @Valid CommentCreateDTO dto,
            Authentication authentication
    ) {
        CommentBasicDTO comment = commentService.updateComment(id, dto, authentication);
        return okResponse(comment, "Comment updated successfully");
    }

    /**
     * Supprime un commentaire
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<SuccessResponse> deleteComment(
            @PathVariable Long id,
            Authentication authentication
    ) {
        commentService.deleteComment(id, authentication);
        return okResponse(null, "Comment deleted successfully");
    }

    /**
     * Récupère toutes les réponses d'un commentaire
     */
    @GetMapping("/{comment-id}/replies")
    public ResponseEntity<SuccessResponse> getCommentReplies(
            @PathVariable("comment-id") Long commentId,
            Authentication authentication
    ) {
        List<CommentBasicDTO> replies = commentService.getCommentReplies(commentId, authentication);
        return okResponse(replies, "Replies successfully fetched.");
    }
}