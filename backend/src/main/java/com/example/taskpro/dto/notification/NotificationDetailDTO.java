package com.example.taskpro.dto.notification;

import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDetailDTO extends NotificationBasicDTO {
    private UserBasicDTO user;
    private TaskBasicDTO relatedTask;
    private ProjectBasicDTO relatedProject;
}
