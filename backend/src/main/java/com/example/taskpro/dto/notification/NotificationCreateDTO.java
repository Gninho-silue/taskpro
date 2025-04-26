package com.example.taskpro.dto.notification;

import com.example.taskpro.model.NotificationType;
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
public class NotificationCreateDTO {
    @NotBlank(message = "Message is required")
    private String message;

    private NotificationType type = NotificationType.GENERAL;

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long relatedTaskId;
    private Long relatedProjectId;
}



