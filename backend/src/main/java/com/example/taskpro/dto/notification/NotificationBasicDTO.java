package com.example.taskpro.dto.notification;

import com.example.taskpro.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;





@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationBasicDTO {
    private Long id;
    private String message;
    private NotificationType type;
    private boolean read;
    private LocalDateTime sentAt;
}

