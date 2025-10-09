package com.example.taskpro.repository;

import com.example.taskpro.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdAndReadFalse(Long id, Pageable pageable);

    Page<Notification> findByUserId(Long id, Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    void markAllAsRead(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    List<Notification> findByUserIdAndSentAtAfterOrderBySentAtDesc(
            Long userId, LocalDateTime since
    );

    Long countByUserIdAndReadFalse(Long id);
}
