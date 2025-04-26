package com.example.taskpro.mapper;


import com.example.taskpro.dto.label.LabelBasicDTO;
import com.example.taskpro.dto.label.LabelCreateDTO;
import com.example.taskpro.dto.label.LabelDetailDTO;
import com.example.taskpro.model.Label;
import com.example.taskpro.model.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LabelMapper {
    @Lazy
    private final TaskMapper taskMapper;

    public LabelBasicDTO toBasicDto(Label label) {
        if (label == null) return null;
        return LabelBasicDTO.builder()
                .id(label.getId())
                .name(label.getName())
                .color(label.getColor())
                .build();
    }

    public LabelDetailDTO toDetailDto(Label label) {
        if (label == null) return null;

        LabelDetailDTO dto = new LabelDetailDTO();
        BeanUtils.copyProperties(toBasicDto(label), dto);

        dto.setProjectId(label.getProject().getId());
        dto.setTasks(label.getTasks().stream()
                .map(taskMapper::toBasicDto)
                .collect(Collectors.toSet()));

        return dto;
    }

    public Label toEntity(LabelCreateDTO dto, Project project) {
        if (dto == null) return null;
        return Label.builder()
                .name(dto.getName())
                .color(dto.getColor())
                .project(project)
                .tasks(new HashSet<>())
                .build();
    }
}