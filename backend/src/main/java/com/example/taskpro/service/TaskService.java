package com.example.taskpro.service;

import com.example.taskpro.dto.comment.CommentBasicDTO;
import com.example.taskpro.dto.label.LabelBasicDTO;
import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.task.TaskBasicDTO;
import com.example.taskpro.dto.task.TaskCreateDTO;
import com.example.taskpro.dto.task.TaskDetailDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.mapper.TaskMapper;
import com.example.taskpro.model.*;
import com.example.taskpro.repository.LabelRepository;
import com.example.taskpro.repository.ProjectRepository;
import com.example.taskpro.repository.TaskRepository;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.util.PageResponse;
import com.example.taskpro.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.example.taskpro.util.SecurityUtil.authorizeProjectAccess;
import static com.example.taskpro.util.SecurityUtil.getConnectedUser;

@Service
@Transactional
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final LabelRepository labelRepository;
    private final TaskMapper taskMapper;

    public TaskDetailDTO toDetailDto(Task task) {
        if (task == null) return null;

        TaskDetailDTO dto = new TaskDetailDTO();
        BeanUtils.copyProperties(taskMapper.toBasicDto(task), dto);

        // Mapper manuellement les relations
        if (task.getCreator() != null) {
            dto.setCreator(new UserBasicDTO(
                    task.getCreator().getId(),
                    task.getCreator().getFirstname(),
                    task.getCreator().getLastname(),
                    task.getCreator().getEmail()
            ));
        }

        if (task.getAssignee() != null) {
            dto.setAssignee(new UserBasicDTO(
                    task.getAssignee().getId(),
                    task.getAssignee().getFirstname(),
                    task.getAssignee().getLastname(),
                    task.getAssignee().getEmail()
            ));
        }

        if (task.getProject() != null) {
            Project p = task.getProject();
            dto.setProject(Set.of(ProjectBasicDTO.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .description(p.getDescription())
                            .status(p.getStatus())
                            .dueDate(p.getDueDate())
                            .startDate(p.getStartDate())
                            .build()

                            ));
        }

        dto.setLabels(new ArrayList<>(task.getLabels()).stream()
                .map(label -> new LabelBasicDTO(
                        label.getId(),
                        label.getName(),
                        label.getColor()
                ))
                .collect(Collectors.toSet()));

        dto.setComments(new ArrayList<>(task.getComments()).stream()
                .map(c -> new CommentBasicDTO(
                        c.getId(),
                        c.getContent(),
                        c.getCreatedAt(),
                        c.getUpdatedAt(),
                        c.getUser() != null ? new UserBasicDTO(
                                c.getUser().getId(),
                                c.getUser().getFirstname(),
                                c.getUser().getLastname(),
                                c.getUser().getEmail()
                        ) : null
                ))
                .collect(Collectors.toSet()));

        return dto;
    }

    public TaskDetailDTO createTask(TaskCreateDTO dto, Authentication authentication) {
        User creator = getConnectedUser(authentication, userRepository);
        Project project = findProjectOrThrow(dto.getProjectId());

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status(TaskStatus.TODO)
                .dueDate(dto.getDueDate())
                .estimatedHours(dto.getEstimatedHours())
                .labels(new HashSet<>())
                .comments(new HashSet<>())
                .attachments(new HashSet<>())
                .subtasks(new HashSet<>())
                .build();

        // Définir les relations
        task.setCreator(creator);
        task.setProject(project);

        if (dto.getAssigneeId() != null) {
            User assignee = findUserOrThrow(dto.getAssigneeId());
            task.assignToUser(assignee);
        }

        if (dto.getParentTaskId() != null) {
            Task parentTask = findTaskOrThrow(dto.getParentTaskId());
            task.setParentTask(parentTask);
        }

        if (dto.getLabelIds() != null && !dto.getLabelIds().isEmpty()) {
            List<Label> labels = labelRepository.findAllById(dto.getLabelIds());
            if (labels.size() != dto.getLabelIds().size()) {
                throw new ResourceNotFoundException("One or more labels not found");
            }

            for (Label label : labels) {
                task.addLabel(label);
            }
        }

        return toDetailDto(taskRepository.save(task));
    }

    public TaskDetailDTO assignTask(Long taskId, Long userId, Authentication authentication) {
        Task task = findTaskOrThrow(taskId);
        User currentUser = getConnectedUser(authentication, userRepository);

        if (!task.getCreator().getId().equals(currentUser.getId())) {
            throw new OperationNotPermittedException("Only the creator can assign the task.");
        }

        // Désassigner l'utilisateur actuel s'il existe
        if (task.getAssignee() != null) {
            task.unassignUser();
        }

        User assignee = findUserOrThrow(userId);
        task.assignToUser(assignee);

        return toDetailDto(taskRepository.save(task));
    }

    public void deleteTask(Long id, Authentication authentication) {
        Task task = findTaskOrThrow(id);
        User currentUser = getConnectedUser(authentication, userRepository);

        if (!task.getCreator().getId().equals(currentUser.getId())) {
            throw new OperationNotPermittedException("You are not allowed to delete this task.");
        }


        task.unassignUser();
        task.removeParentTask();

        // Si task est un parent, supprimer les relations enfant
        for (Task subtask : new HashSet<>(task.getSubtasks())) {
            subtask.removeParentTask();
            taskRepository.save(subtask);
        }

        taskRepository.deleteById(id);
    }


    public TaskDetailDTO getTaskById(Long id, Authentication authentication) {
        Task task = findTaskOrThrow(id);
        verifyAccess(task, authentication);
        return toDetailDto(task);
    }

    public PageResponse<TaskBasicDTO> getTasksByAssignee(Long userId, int page, int size, Authentication authentication) {
        User currentUser = getConnectedUser(authentication, userRepository);
        if (!currentUser.getId().equals(userId)) {
            throw new OperationNotPermittedException("You can only access your own tasks.");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Task> taskPage = taskRepository.findTasksByAssigneeId(userId, pageable);
        Page<TaskBasicDTO> dtoPage = taskPage.map(taskMapper::toBasicDto);
        return PaginationUtil.buildPageResponse(dtoPage);
    }

    public PageResponse<TaskBasicDTO> getTasksByProject(Long projectId, int page, int size, Authentication authentication) {
        User currentUser = getConnectedUser(authentication, userRepository);
        Project project =findProjectOrThrow(projectId);
        authorizeProjectAccess(project, currentUser);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Task> taskPage = taskRepository.findTasksByProjectId(projectId, pageable);
        Page<TaskBasicDTO> dtoPage = taskPage.map(taskMapper::toBasicDto);
        return PaginationUtil.buildPageResponse(dtoPage);
    }

    public TaskDetailDTO updateTask(Long id, TaskCreateDTO dto, Authentication authentication) {
        Task task = findTaskOrThrow(id);
        User currentUser = getConnectedUser(authentication, userRepository);

        if (!task.getCreator().getId().equals(currentUser.getId())) {
            throw new OperationNotPermittedException("You are not allowed to update this task.");
        }

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getEstimatedHours() != null) task.setEstimatedHours(dto.getEstimatedHours());

        if (dto.getAssigneeId() != null) {
            User assignee = findUserOrThrow(dto.getAssigneeId());
            task.setAssignee(assignee);
        }

        if (dto.getLabelIds() != null) {
            List<Label> labels = labelRepository.findAllById(dto.getLabelIds());
            if (labels.size() != dto.getLabelIds().size()) {
                throw new ResourceNotFoundException("One or more labels not found");
            }
            task.setLabels(new HashSet<>(labels));
        }

        return toDetailDto(taskRepository.save(task));
    }

    public TaskDetailDTO updateStatus(Long taskId, TaskStatus newStatus, Authentication authentication) {
        Task task = findTaskOrThrow(taskId);
        User currentUser = getConnectedUser(authentication, userRepository);

        if (task.getAssignee() == null) {
            throw new OperationNotPermittedException("This task has no assignee.");
        }

        if (!task.getAssignee().getId().equals(currentUser.getId())) {
            throw new OperationNotPermittedException("Only the assignee can update the task status.");
        }

        if (!isValidStatusTransition(task.getStatus(), newStatus)) {
            throw new OperationNotPermittedException("Invalid status transition from " + task.getStatus() + " to " + newStatus);
        }

        task.setStatus(newStatus);
        return toDetailDto(taskRepository.save(task));
    }

    public PageResponse<TaskBasicDTO> getSubtasks(Long parentId, int page, int size, Authentication authentication) {
        Task parent = findTaskOrThrow(parentId);
        verifyAccess(parent, authentication);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Task> subtaskPage = taskRepository.findTasksByParentTaskId(parentId, pageable);
        Page<TaskBasicDTO> dtoPage = subtaskPage.map(taskMapper::toBasicDto);

        return PaginationUtil.buildPageResponse(dtoPage);
    }


    //  === Les méthodes helpers  ===
    private void verifyAccess(Task task, Authentication authentication) {
        User currentUser = getConnectedUser(authentication, userRepository);
        boolean isCreator = task.getCreator() != null && task.getCreator().getId().equals(currentUser.getId());
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(currentUser.getId());

        if (!isCreator && !isAssignee) {
            throw new OperationNotPermittedException("Access denied to this task.");
        }
    }

    private boolean isValidStatusTransition(TaskStatus from, TaskStatus to) {
        return switch (from) {
            case TODO -> to == TaskStatus.IN_PROGRESS || to == TaskStatus.DONE;
            case IN_PROGRESS -> to == TaskStatus.IN_REVIEW || to == TaskStatus.TODO;
            case IN_REVIEW -> to == TaskStatus.DONE;
            case DONE, ARCHIVED -> false;
        };
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

}


