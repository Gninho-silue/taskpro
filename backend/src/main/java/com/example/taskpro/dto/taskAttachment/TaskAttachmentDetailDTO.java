package com.example.taskpro.dto.taskAttachment;

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
public class TaskAttachmentDetailDTO extends TaskAttachmentBasicDTO {
    private String filePath;
    private Long taskId;
    private UserBasicDTO uploader;
}