package com.example.taskpro.mapper;

import com.example.taskpro.dto.taskAttachment.TaskAttachmentBasicDTO;
import com.example.taskpro.dto.taskAttachment.TaskAttachmentCreateDTO;
import com.example.taskpro.dto.taskAttachment.TaskAttachmentDetailDTO;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.TaskAttachment;
import com.example.taskpro.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class TaskAttachmentMapper {
    private final UserMapper userMapper;

    public TaskAttachmentBasicDTO toBasicDto(TaskAttachment attachment) {
        if (attachment == null) return null;
        return TaskAttachmentBasicDTO.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .build();
    }

    public TaskAttachmentDetailDTO toDetailDto(TaskAttachment attachment) {
        if (attachment == null) return null;

        TaskAttachmentDetailDTO dto = new TaskAttachmentDetailDTO();
        BeanUtils.copyProperties(toBasicDto(attachment), dto);

        dto.setFilePath(attachment.getFilePath());
        dto.setTaskId(attachment.getTask().getId());
        dto.setUploader(userMapper.toBasicDto(attachment.getUploader()));

        return dto;
    }

    public TaskAttachment toEntity(TaskAttachmentCreateDTO dto, Task task, User uploader) {
        if (dto == null) return null;
        return TaskAttachment.builder()
                .fileName(dto.getFileName())
                .fileType(dto.getFileType())
                .filePath(dto.getFilePath())
                .fileSize(dto.getFileSize())
                .task(task)
                .uploader(uploader)
                .build();
    }
}