package com.example.taskpro.dto.task;

import com.example.taskpro.dto.comment.CommentBasicDTO;
import com.example.taskpro.dto.label.LabelBasicDTO;
import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.taskAttachment.TaskAttachmentBasicDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.model.TaskPriority;
import com.example.taskpro.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Set;


@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TaskDetailDTO extends TaskBasicDTO {
    private UserBasicDTO creator;
    private UserBasicDTO assignee;
    private Long parentTaskId;
    private Set<ProjectBasicDTO> project;
    private Set<TaskBasicDTO> subtasks;
    private Set<LabelBasicDTO> labels;
    private Set<CommentBasicDTO> comments;
    private Set<TaskAttachmentBasicDTO> attachments;


}

