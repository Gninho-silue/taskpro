package com.example.taskpro.repository;

import com.example.taskpro.model.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttachmentRepository extends JpaRepository<TaskAttachment, Long> {
}
