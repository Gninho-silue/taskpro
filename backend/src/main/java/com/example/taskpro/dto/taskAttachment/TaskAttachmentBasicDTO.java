package com.example.taskpro.dto.taskAttachment;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAttachmentBasicDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
}



