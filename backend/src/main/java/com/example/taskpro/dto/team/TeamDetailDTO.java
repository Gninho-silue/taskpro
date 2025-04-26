package com.example.taskpro.dto.team;


import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Set;



@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TeamDetailDTO extends TeamBasicDTO {
    private UserBasicDTO leader;
    private Set<UserBasicDTO> members;
    private Set<ProjectBasicDTO> projects;
}
