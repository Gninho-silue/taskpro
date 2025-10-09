package com.example.taskpro.dto.comment;


import com.example.taskpro.dto.user.UserBasicDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;




@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CommentBasicDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserBasicDTO user;
}



