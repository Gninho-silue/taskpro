package com.example.taskpro.dto.project;

import com.example.taskpro.dto.label.LabelBasicDTO;
import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.dto.team.TeamBasicDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Set;


@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ProjectDetailDTO extends ProjectBasicDTO {
    private UserBasicDTO owner;
    private TeamBasicDTO team;
    private Set<UserBasicDTO> members;
    private Set<TaskBasicDTO> tasks;
    private Set<LabelBasicDTO> labels;

}