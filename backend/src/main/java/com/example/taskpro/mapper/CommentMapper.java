package com.example.taskpro.mapper;

import com.example.taskpro.dto.comment.CommentBasicDTO;
import com.example.taskpro.dto.comment.CommentCreateDTO;
import com.example.taskpro.dto.comment.CommentDetailDTO;
import com.example.taskpro.model.Comment;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
public class CommentMapper {
    private final UserMapper userMapper;

    public CommentBasicDTO toBasicDto(Comment comment) {
        if (comment == null) return null;
        return CommentBasicDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .user(userMapper.toBasicDto(comment.getUser()))
                .build();
    }

    public CommentDetailDTO toDetailDto(Comment comment) {
        if (comment == null) return null;

        CommentDetailDTO dto = new CommentDetailDTO();
        BeanUtils.copyProperties(toBasicDto(comment), dto);

        dto.setTaskId(comment.getTask().getId());
        dto.setParentCommentId(comment.getParentComment() != null ?
                comment.getParentComment().getId() : null);
        dto.setReplies(comment.getReplies().stream()
                .map(this::toBasicDto)
                .collect(Collectors.toSet()));

        return dto;
    }

    public Comment toEntity(CommentCreateDTO dto, Task task, User user, Comment parentComment) {
        if (dto == null) return null;
        return Comment.builder()
                .content(dto.getContent())
                .task(task)
                .user(user)
                .parentComment(parentComment)
                .replies(new HashSet<>())
                .build();
    }
}