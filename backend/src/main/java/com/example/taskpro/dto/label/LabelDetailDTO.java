package com.example.taskpro.dto.label;

import com.example.taskpro.dto.task.TaskBasicDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LabelDetailDTO extends LabelBasicDTO {
    private Long projectId;
    private Set<TaskBasicDTO> tasks;
}

