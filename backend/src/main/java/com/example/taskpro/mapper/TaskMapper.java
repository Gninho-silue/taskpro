package com.example.taskpro.mapper;

import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.dto.task.TaskCreateDTO;
import com.example.taskpro.model.Task;
import org.springframework.stereotype.Component;

import java.util.HashSet;


@Component
public class TaskMapper {
    public TaskBasicDTO toBasicDto(Task task) {
        if (task == null) return null;
        return TaskBasicDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .estimatedHours(task.getEstimatedHours())
                .build();
    }

    public Task toEntity(TaskCreateDTO dto) {
        if (dto == null) return null;
        return Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .dueDate(dto.getDueDate())
                .estimatedHours(dto.getEstimatedHours())
                .status(dto.getStatus())
                .labels(new HashSet<>())          // Initialiser les collections
                .comments(new HashSet<>())
                .attachments(new HashSet<>())
                .subtasks(new HashSet<>())
                .build();
    }
}