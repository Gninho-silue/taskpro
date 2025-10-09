package com.example.taskpro.controller;

import com.example.taskpro.dto.taskAttachment.TaskAttachmentBasicDTO;
import com.example.taskpro.service.TaskAttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("attachments")
@RequiredArgsConstructor
@Tag(name = "Task Attachments", description = "Attachment management API")
@SecurityRequirement(name = "bearerAuth")
public class TaskAttachmentController {

    private final TaskAttachmentService attachmentService;

    @PostMapping("/tasks/{taskId}")
    @Operation(summary = "Add attachment to a task")
    public ResponseEntity<TaskAttachmentBasicDTO> addAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        
        TaskAttachmentBasicDTO attachment = attachmentService.addAttachment(taskId, file, authentication);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve Attachement by ID")
    public ResponseEntity<TaskAttachmentBasicDTO> getAttachmentById(
            @PathVariable Long id,
            Authentication authentication) {
        
        TaskAttachmentBasicDTO attachment = attachmentService.getAttachmentById(id, authentication);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/tasks/{task-id}")
    @Operation(summary = "Get all attachment from a task")
    public ResponseEntity<List<TaskAttachmentBasicDTO>> getAttachmentsByTaskId(
            @PathVariable("task-id") Long taskId,
            Authentication authentication) {
        
        List<TaskAttachmentBasicDTO> attachments = attachmentService.getAttachmentsByTaskId(taskId, authentication);
        return ResponseEntity.ok(attachments);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an attachment")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long id,
            Authentication authentication) {
        
        attachmentService.deleteAttachment(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download an attachment")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long id,
            Authentication authentication) throws IOException {
        
        TaskAttachmentBasicDTO attachment = attachmentService.getAttachmentById(id, authentication);
        byte[] fileContent = attachmentService.downloadAttachment(id, authentication);
        
        ByteArrayResource resource = new ByteArrayResource(fileContent);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);
    }
}