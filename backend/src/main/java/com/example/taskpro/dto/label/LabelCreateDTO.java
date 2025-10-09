package com.example.taskpro.dto.label;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelCreateDTO {
    @NotBlank(message = "Label name is required")
    @Size(min = 2, max = 50, message = "Label name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Label color is required")
    private String color;

    @NotNull(message = "Project ID is required")
    private Long projectId;
}