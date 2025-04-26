package com.example.taskpro.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectCreateDTO {
    @NotBlank(message = "Project name is required")
    @Size(min = 3, max = 100, message = "Project name must be between 3 and 100 characters")
    private String name;
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private Long teamId;

}
