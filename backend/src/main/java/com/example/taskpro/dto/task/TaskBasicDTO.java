package com.example.taskpro.dto.task;

import com.example.taskpro.model.TaskPriority;
import com.example.taskpro.model.TaskStatus;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;


@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TaskBasicDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDateTime dueDate;
    private Integer estimatedHours;
    private Integer actualHours;
}
