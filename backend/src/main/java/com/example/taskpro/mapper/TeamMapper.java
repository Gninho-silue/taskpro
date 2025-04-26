package com.example.taskpro.mapper;

import com.example.taskpro.dto.team.TeamBasicDTO;
import com.example.taskpro.dto.team.TeamCreateDTO;
import com.example.taskpro.model.Team;

import org.springframework.stereotype.Component;


@Component
public class TeamMapper {
    public TeamBasicDTO toBasicDto(Team team) {
        if (team == null) return null;
        return TeamBasicDTO.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .build();
    }

    public Team toEntity(TeamCreateDTO dto) {
        if (dto == null) return null;
        return Team.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }
}