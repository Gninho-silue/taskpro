package com.example.taskpro.controller;

import com.example.taskpro.dto.label.LabelBasicDTO;
import com.example.taskpro.dto.label.LabelCreateDTO;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.service.LabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("labels")
@RequiredArgsConstructor
public class LabelController extends BaseController {

    private final LabelService labelService;

    /**
     * Crée un nouveau label
     */
    @PostMapping
    public ResponseEntity<SuccessResponse> createLabel(
             @RequestBody @Valid LabelCreateDTO dto,
            Authentication authentication
    ){
        LabelBasicDTO label = labelService.createLabel(dto, authentication);
        return createdResponse(label, "Label created successfully");
    }

    /**
     * Récupère un label par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse> getLabelById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        LabelBasicDTO label = labelService.getLabelById(id, authentication);
        return okResponse(label, "Label fetched successfully");
    }

    /**
     * Récupère tous les labels d'un projet
     */
    @GetMapping("/project/{project-id}")
    public ResponseEntity<SuccessResponse> getLabelsByProject(
            @PathVariable("project-id") Long projectId,
            Authentication authentication) {
        List<LabelBasicDTO> labels = labelService.getLabelsByProject(projectId, authentication);
        return okResponse(labels, "Labels fetched successfully");
    }

    /**
     * Met à jour un label existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<SuccessResponse> updateLabel(
            @PathVariable Long id,
            @Valid @RequestBody LabelCreateDTO request,
            Authentication authentication
    ) {
        LabelBasicDTO label = labelService.updateLabel(id, request, authentication);
        return okResponse(label, "Label has been updated successfully");
    }

    /**
     * Supprime un label
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<SuccessResponse> deleteLabel(
            @PathVariable Long id,
            Authentication authentication) {
        labelService.deleteLabel(id, authentication);
        return okResponse(null, "Label deleted successfully");
    }

    /**
     * Ajoute un label à une tâche
     */
    @PostMapping("/{label-id}/tasks/{task-id}")
    public ResponseEntity<SuccessResponse> addLabelToTask(
            @PathVariable("label-id") Long labelId,
            @PathVariable("task-id") Long taskId,
            Authentication authentication
    ) {
        labelService.addLabelToTask(taskId, labelId, authentication);
        return okResponse(null, "Label has been added to the task successfully");
    }

    /**
     * Supprime un label d'une tâche
     */
    @DeleteMapping("/{label-id}/tasks/{task-id}")
    public ResponseEntity<SuccessResponse> removeLabelFromTask(
            @PathVariable("label-id") Long labelId,
            @PathVariable("task-id") Long taskId,
            Authentication authentication) {
        labelService.removeLabelFromTask(taskId, labelId, authentication);
        return okResponse(null, "Label has been removed from the task successfully");
    }
}