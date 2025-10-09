package com.example.taskpro.repository;

import com.example.taskpro.model.Audit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditRepository extends JpaRepository<Audit, Long> {
    List<Audit> findByEntityTypeAndEntityId(String entityType, Long entityId);
    List<Audit> findByUserId(Long userId);
}