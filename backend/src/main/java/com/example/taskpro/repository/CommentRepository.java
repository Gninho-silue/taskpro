package com.example.taskpro.repository;

import com.example.taskpro.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskId(Long taskId);

    List<Comment> findByTaskIdAndParentCommentIsNull(Long taskId);

    List<Comment> findByParentCommentId(Long commentId);
}
