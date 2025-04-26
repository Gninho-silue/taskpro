package com.example.taskpro.mapper;

import com.example.taskpro.dto.label.LabelBasicDTO;
import com.example.taskpro.dto.label.LabelCreateDTO;
import com.example.taskpro.dto.label.LabelDetailDTO;
import com.example.taskpro.dto.notification.NotificationBasicDTO;
import com.example.taskpro.dto.notification.NotificationCreateDTO;
import com.example.taskpro.dto.notification.NotificationDetailDTO;
import com.example.taskpro.dto.taskAttachment.TaskAttachmentBasicDTO;
import com.example.taskpro.dto.taskAttachment.TaskAttachmentCreateDTO;
import com.example.taskpro.dto.taskAttachment.TaskAttachmentDetailDTO;
import com.example.taskpro.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.stream.Collectors;

// NotificationMapper.java
@Component
@RequiredArgsConstructor
public class NotificationMapper {
    private final UserMapper userMapper;
    private final TaskMapper taskMapper;
    private final ProjectMapper projectMapper;

    public NotificationBasicDTO toBasicDto(Notification notification) {
        if (notification == null) return null;
        return NotificationBasicDTO.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .sentAt(notification.getSentAt())
                .build();
    }

    public NotificationDetailDTO toDetailDto(Notification notification) {
        if (notification == null) return null;

        NotificationDetailDTO dto = new NotificationDetailDTO();
        BeanUtils.copyProperties(toBasicDto(notification), dto);

        dto.setUser(userMapper.toBasicDto(notification.getUser()));
        dto.setRelatedTask(notification.getRelatedTask() != null ?
                taskMapper.toBasicDto(notification.getRelatedTask()) : null);
        dto.setRelatedProject(notification.getRelatedProject() != null ?
                projectMapper.toBasicDto(notification.getRelatedProject()) : null);

        return dto;
    }

    public Notification toEntity(NotificationCreateDTO dto, User user, Task relatedTask, Project relatedProject) {
        if (dto == null) return null;
        return Notification.builder()
                .message(dto.getMessage())
                .type(dto.getType())
                .user(user)
                .relatedTask(relatedTask)
                .relatedProject(relatedProject)
                .sentAt(LocalDateTime.now())
                .read(false)
                .build();
    }
}
