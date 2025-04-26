package com.example.taskpro.dto.user;

import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.dto.team.TeamBasicDTO;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Set;


@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserDetailDTO extends UserBasicDTO {
    private Set<ProjectBasicDTO> projects;
    private Set<TeamBasicDTO> teams;
    private Set<TaskBasicDTO> assignedTasks;
}
