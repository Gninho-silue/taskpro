package com.example.taskpro.dto.comment;

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
public class CommentCreateDTO {
    @NotBlank(message = "This field is required")
    @Size(min = 2, max = 2000)
    private String content;

    @NotNull(message = "Task ID is required")
    private Long taskId;

    private Long parentCommentId;
}