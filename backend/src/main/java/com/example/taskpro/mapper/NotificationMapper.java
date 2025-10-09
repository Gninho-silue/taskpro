package com.example.taskpro.mapper;

import com.example.taskpro.dto.notification.NotificationBasicDTO;
import com.example.taskpro.dto.notification.NotificationCreateDTO;
import com.example.taskpro.dto.notification.NotificationDetailDTO;
import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.model.Notification;
import com.example.taskpro.model.Project;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;


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

    public NotificationDetailDTO toNotificationDetail(Notification notification) {
        if (notification == null) return null;

        NotificationDetailDTO dto = new NotificationDetailDTO();
        BeanUtils.copyProperties(toBasicDto(notification), dto);

        UserBasicDTO user = userMapper.toBasicDto(notification.getUser());
        dto.setUser(
                user
        );


        // Ajouter les détails de l'entité liée
        if (notification.getRelatedTask() != null) {
            TaskBasicDTO task = taskMapper.toBasicDto(notification.getRelatedTask());
            dto.setRelatedTask(task);
        }

        if (notification.getRelatedProject() != null) {
            ProjectBasicDTO project = projectMapper.toBasicDto(notification.getRelatedProject());
            dto.setRelatedProject(project);

        }

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
