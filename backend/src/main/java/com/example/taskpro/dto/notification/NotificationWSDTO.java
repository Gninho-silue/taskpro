package com.example.taskpro.dto.notification;

import com.example.taskpro.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationWSDTO {
    private Long id;
    private String message;
    private LocalDateTime sentAt;
    private NotificationType type;
    private Long userId;
    private Long taskId;
    private Long projectId;
    private String taskTitle;
    private String projectName;
}