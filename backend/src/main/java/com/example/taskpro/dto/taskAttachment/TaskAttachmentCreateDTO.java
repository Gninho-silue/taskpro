package com.example.taskpro.dto.taskAttachment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAttachmentCreateDTO {
    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File type is required")
    private String fileType;

    @NotBlank(message = "File path is required")
    private String filePath;

    @NotNull(message = "File size is required")
    private Long fileSize;

    @NotNull(message = "Task ID is required")
    private Long taskId;


}
