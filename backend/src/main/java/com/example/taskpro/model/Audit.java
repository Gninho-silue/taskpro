package com.example.taskpro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Audit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String entityType;
    
    @Column(nullable = false)
    private Long entityId;
    
    @Column(nullable = false)
    private String action;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(length = 1000)
    private String details;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}