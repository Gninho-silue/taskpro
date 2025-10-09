package com.example.taskpro.service;

import com.example.taskpro.dto.label.LabelBasicDTO;
import com.example.taskpro.dto.label.LabelCreateDTO;
import com.example.taskpro.dto.label.LabelDetailDTO;
import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.mapper.LabelMapper;
import com.example.taskpro.model.Label;
import com.example.taskpro.model.Project;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.LabelRepository;
import com.example.taskpro.repository.ProjectRepository;
import com.example.taskpro.repository.TaskRepository;
import com.example.taskpro.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.example.taskpro.util.SecurityUtil.authorizeLabelAccess;
import static com.example.taskpro.util.SecurityUtil.getConnectedUser;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final LabelMapper labelMapper;

    public LabelDetailDTO toLabelDetail(Label label) {
        if (label == null) return null;
        LabelDetailDTO dto = new LabelDetailDTO();
        BeanUtils.copyProperties(labelMapper.toBasicDto(label), dto);
        dto.setProjectId(label.getProject() != null ? label.getProject().getId() : null);

        if (label.getTasks() != null) {
            dto.setTasks(label.getTasks().stream()
                    .map(task -> new TaskBasicDTO(
                            task.getId(),
                            task.getTitle(),
                            task.getDescription(),
                            task.getStatus(),
                            task.getPriority(),
                            task.getDueDate(),
                            task.getEstimatedHours(),
                            task.getActualHours()

                    )).collect(Collectors.toSet())
            );


        }
        return dto;
    }


    /**
     * Crée un nouveau label
     */
    public LabelDetailDTO createLabel(LabelCreateDTO dto, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Project project = findProjectOrThrow(dto.getProjectId());
        authorizeLabelAccess(project, connectedUser, "You don't have permission to create labels for this project");

        Label label = Label.builder()
                .name(dto.getName())
                .color(dto.getColor())
                .build();
        
        label.setProject(project);
        return toLabelDetail(labelRepository.save(label));
    }
    
    /**
     * Obtient tous les labels d'un projet
     */
    public List<LabelBasicDTO> getLabelsByProject(Long projectId, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Project project = findProjectOrThrow(projectId);

        authorizeLabelAccess(project, connectedUser, "You don't have permission to view labels for this project");

        return labelRepository.findByProjectId(projectId).stream()
                .map(labelMapper::toBasicDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtient un label par son ID
     */
    public LabelBasicDTO getLabelById(Long id, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Label label = findLabelOrThrow(id);
        Project project = label.getProject();
        authorizeLabelAccess(project, connectedUser, "You don't have permission to view this label");
        
        return labelMapper.toBasicDto(label);
    }
    
    /**
     * Met à jour un label existant
     */
    public LabelBasicDTO updateLabel(Long id, LabelCreateDTO dto, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Label label = findLabelOrThrow(id);
        Project project = label.getProject();

        if (project != null && !project.getOwner().equals(connectedUser)) {
            throw new OperationNotPermittedException("Only the project owner can update labels");
        }

        label.setName(dto.getName());
        label.setColor(dto.getColor());
        
        // Si le projet change, mettre à jour la relation
        if (project != null && !project.getId().equals(dto.getProjectId())) {
            Project newProject = findProjectOrThrow(dto.getProjectId());

            if (!newProject.getOwner().equals(connectedUser)) {
                throw new OperationNotPermittedException("You don't have permission to move this label to the specified project");
            }

            label.removeFromProject();
            label.setProject(newProject);
        }

        return labelMapper.toBasicDto(labelRepository.save(label));
    }
    
    /**
     * Supprime un label
     */
    public void deleteLabel(Long id, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Label label = findLabelOrThrow(id);
        Project project = label.getProject();

        if (project != null && !project.getOwner().equals(connectedUser)) {
            throw new OperationNotPermittedException("Only the project owner can delete labels");
        }
        
        // Enlever le label de toutes les tâches associées
        for (Task task : label.getTasks()) {
            task.removeLabel(label);
        }
        
        label.removeFromProject();

        labelRepository.deleteById(id);
    }
    

    /**
     * Ajoute un label à une tâche
     */
    public void addLabelToTask(Long taskId, Long labelId, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);

        Task task = findTaskOrThrow(taskId);
        Label label = findLabelOrThrow(labelId);

        Project project = task.getProject();
        authorizeLabelAccess(project, connectedUser, "You don't have permission to add labels to this task");

        if (!label.getProject().getId().equals(project.getId())) {
            throw new OperationNotPermittedException("Label doesn't belong to the same project as the task");
        }

        if (task.getLabels().stream().anyMatch(l -> l.getId().equals(labelId))) {
            return; // Le label est déjà associé, rien à faire
        }

        task.getLabels().add(label);

        taskRepository.save(task);
    }
    /**
     * Supprime un label d'une tâche
     */
    public void removeLabelFromTask(Long taskId, Long labelId, Authentication authentication) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Task task = findTaskOrThrow(taskId);
        Label label = findLabelOrThrow(labelId);

        if (!task.getCreator().equals(connectedUser) && !task.getAssignee().equals(connectedUser)) {
            throw new OperationNotPermittedException("Only the task creator or assignee can remove labels");
        }

        if (!task.getLabels().contains(label)) {
            return;
        }

        task.getLabels().remove(label);
        taskRepository.save(task);
    }


    // === HELPERS ===

    private Label findLabelOrThrow(Long id) {
        return labelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

}