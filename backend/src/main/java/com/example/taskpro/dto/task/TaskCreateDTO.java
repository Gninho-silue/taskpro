package com.example.taskpro.dto.task;

import com.example.taskpro.model.TaskPriority;
import com.example.taskpro.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskCreateDTO {
    @NotBlank(message = "Task title is required")
    @Size(min = 3, max = 100, message = "Task title must be between 3 and 100 characters")
    private String title;
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;
    private TaskStatus status = TaskStatus.TODO;
    private TaskPriority priority = TaskPriority.MEDIUM;
    private LocalDateTime dueDate;
    private Integer estimatedHours;
    private Long parentTaskId;
    private Long assigneeId;
    private Long projectId;
    private Set<Long> labelIds = new HashSet<>();
}



