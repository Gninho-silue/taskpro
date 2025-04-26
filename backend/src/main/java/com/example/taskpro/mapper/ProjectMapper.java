package com.example.taskpro.mapper;

import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.project.ProjectCreateDTO;
import com.example.taskpro.model.Project;
import com.example.taskpro.model.ProjectStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProjectMapper {

    public ProjectBasicDTO toBasicDto(Project project) {
        if (project == null) return null;
        return ProjectBasicDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .dueDate(project.getDueDate())
                .build();
    }

    public Project toEntity(ProjectCreateDTO dto) {
        if (dto == null) return null;
        return Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .dueDate(dto.getDueDate())
                .status(ProjectStatus.ACTIVE)
                .build();
    }

}