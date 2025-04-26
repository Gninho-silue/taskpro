package com.example.taskpro.controller;

import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.dto.task.TaskCreateDTO;
import com.example.taskpro.dto.task.TaskDetailDTO;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.model.TaskStatus;
import com.example.taskpro.service.TaskService;
import com.example.taskpro.util.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("tasks")
@RequiredArgsConstructor
public class TaskController extends  BaseController{

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<SuccessResponse> createTask(
            @RequestBody @Valid TaskCreateDTO request,
            Authentication authentication
    ) {
        TaskDetailDTO task = taskService.createTask(request, authentication);
        return createdResponse(task, "Task created successfully");

    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse> getTask(
            @PathVariable Long id,
            Authentication authentication
    ) {
        TaskDetailDTO task = taskService.getTaskById(id, authentication);
        return okResponse(task, "Task fetched successfully");

    }

    @GetMapping("/assignee/{user-id}")
    public ResponseEntity<SuccessResponse> getTasksByAssignee(
            @PathVariable("user-id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PageResponse<TaskBasicDTO> tasks = taskService.getTasksByAssignee(userId, page, size, authentication);
        return okResponse(tasks, "Tasks fetched successfully");

    }

    @GetMapping("/project/{project-id}")
    public ResponseEntity<SuccessResponse> getTasksByProject(
            @PathVariable("project-id") Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PageResponse<TaskBasicDTO> tasks = taskService.getTasksByProject(projectId, page, size, authentication);
        return okResponse(tasks, "Tasks retrieved successfully");

    }

    @PatchMapping("/{id}")
    public ResponseEntity<SuccessResponse> updateTask(
            @PathVariable Long id,
            @RequestBody @Valid TaskCreateDTO request,
            Authentication authentication
    ) {
        TaskDetailDTO updateTask = taskService.updateTask(id, request, authentication);
        return okResponse(updateTask, "Task updated successfully");

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SuccessResponse> deleteTask(
            @PathVariable Long id,
            Authentication authentication
    ) {
        taskService.deleteTask(id, authentication);
        return okResponse(null, "Task deleted successfully");

    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<SuccessResponse> assignTask(
            @PathVariable Long id,
            @RequestParam Long userId,
            Authentication authentication
    ) {
        TaskDetailDTO task = taskService.assignTask(id, userId, authentication);
        return okResponse(task, "Task has been assigned successfully.");
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SuccessResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            Authentication authentication
    ) {
        TaskDetailDTO task = taskService.updateStatus(id, status, authentication);
        return okResponse(task, "Task status updated successfully");

    }

    @GetMapping("/{id}/subtasks")
    public ResponseEntity<SuccessResponse> getSubtasks(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PageResponse<TaskBasicDTO> tasks = taskService.getSubtasks(id, page, size, authentication);
        return okResponse(tasks, "Task fetched successfully");

    }
}
