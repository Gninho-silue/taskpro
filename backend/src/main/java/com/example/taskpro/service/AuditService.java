package com.example.taskpro.service;

import com.example.taskpro.model.Audit;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.AuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {
    
    private final AuditRepository auditRepository;
    
    /**
     * Crée une entrée d'audit avec l'utilisateur qui a effectué l'action
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void audit(String entityType, Long entityId, String action, User user, String details) {
        Audit audit = Audit.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .user(user)
                .timestamp(LocalDateTime.now())
                .details(details)
                .build();
                
        auditRepository.save(audit);
    }
    
    /**
     * Récupère l'historique d'audit pour une entité spécifique
     */
    @Transactional(readOnly = true)
    public List<Audit> getAuditHistory(String entityType, Long entityId) {
        return auditRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
    
    /**
     * Récupère l'historique d'audit pour un utilisateur spécifique
     */
    @Transactional(readOnly = true)
    public List<Audit> getUserAuditHistory(Long userId) {
        return auditRepository.findByUserId(userId);
    }
}