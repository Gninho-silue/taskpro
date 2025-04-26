package com.example.taskpro.dto.comment;

import com.example.taskpro.dto.user.UserBasicDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Set;


@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CommentDetailDTO extends CommentBasicDTO {
    private Long taskId;
    private Long parentCommentId;
    private Set<CommentBasicDTO> replies;
}