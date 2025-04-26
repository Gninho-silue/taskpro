package com.example.taskpro.repository;

import com.example.taskpro.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Page<Project> findByOwnerId(Long ownerId, Pageable pageable);
    Page<Project> findByTeamId(Long teamId, Pageable pageable);

    @Query(
            """
               SELECT project FROM Project project
               WHERE project.archived = false
            """
    )

    Page<Project> findAllDisplayableProjects(Pageable pageable, Long userId);

}
