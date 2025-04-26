package com.example.taskpro.repository;

import com.example.taskpro.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findTasksByProjectId(Long projectId, Pageable pageable);
    Page<Task> findTasksByAssigneeId(Long assigneeId, Pageable pageable);
    Page<Task> findTasksByParentTaskId(Long parentId, Pageable pageable);
}
