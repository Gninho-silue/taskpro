package com.example.taskpro.service;

import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.project.ProjectCreateDTO;
import com.example.taskpro.dto.project.ProjectDetailDTO;
import com.example.taskpro.dto.team.TeamBasicDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.mapper.ProjectMapper;
import com.example.taskpro.model.*;
import com.example.taskpro.repository.ProjectRepository;
import com.example.taskpro.repository.TeamRepository;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.util.PageResponse;
import com.example.taskpro.util.PaginationUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.stream.Collectors;

import static com.example.taskpro.util.SecurityUtil.getConnectedUser;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectMapper projectMapper;

    public ProjectDetailDTO toDetailDto(Project project) {
        if (project == null) return null;

        ProjectDetailDTO dto = new ProjectDetailDTO();
        BeanUtils.copyProperties(projectMapper.toBasicDto(project), dto);

        // Mapper manuellement les relations
        if (project.getOwner() != null) {
            dto.setOwner(new UserBasicDTO(
                    project.getOwner().getId(),
                    project.getOwner().getFirstname(),
                    project.getOwner().getLastname(),
                    project.getOwner().getEmail()
            ));
        }

        if (project.getTeam() != null) {
            dto.setTeam(new TeamBasicDTO(
                    project.getTeam().getId(),
                    project.getTeam().getName(),
                    project.getTeam().getDescription()
            ));
        }

        dto.setMembers(project.getMembers().stream()
                .map(user -> new UserBasicDTO(
                        user.getId(),
                        user.getFirstname(),
                        user.getLastname(),
                        user.getEmail()
                ))
                .collect(Collectors.toSet()));

        return dto;
    }

    public ProjectDetailDTO createProject(ProjectCreateDTO dto, Authentication authentication) {
        User owner = getConnectedUser(authentication, userRepository);
        Team team = null;

        if (dto.getTeamId() != null) {
            team = findTeamOrThrow(dto.getTeamId());

            if (!team.getMembers().contains(owner) && !team.getLeader().equals(owner)) {
                throw new OperationNotPermittedException("You must be a member or leader of the team to create a project for it");
            }
        }

        // Créer le projet avec les données de base
        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .dueDate(dto.getDueDate())
                .status(ProjectStatus.ACTIVE)
                .archived(false)
                .members(new HashSet<>())
                .build();

        // Configurer les relations
        project.setOwner(owner);
        project.assignTeam(team);
        project.addMember(owner);

        // Sauvegarder le projet
        return toDetailDto(projectRepository.save(project));
    }

    public ProjectDetailDTO addMemberToProject(Long projectId, Long userId, Authentication authentication) {
        Project project = findProjectOrThrow(projectId);
        authorizeProjectOwner(project, getConnectedUser(authentication, userRepository));

        User user = findUserOrThrow(userId);

        if (project.getMembers().contains(user)) {
            throw new OperationNotPermittedException("User is already a member of this project");
        }

        project.addMember(user);
        return toDetailDto(projectRepository.save(project));
    }

    public ProjectDetailDTO removeMemberFromProject(Long projectId, Long userId, Authentication authentication) {
        Project project = findProjectOrThrow(projectId);
        authorizeProjectOwner(project, getConnectedUser(authentication, userRepository));

        User user = findUserOrThrow(userId);

        if (project.getOwner().equals(user)) {
            throw new OperationNotPermittedException("Cannot remove the project owner");
        }

        if (!project.getMembers().contains(user)) {
            throw new OperationNotPermittedException("User is not a member of this project");
        }

        project.removeMember(user);
        return toDetailDto(projectRepository.save(project));
    }

    public ProjectDetailDTO assignProjectToTeam(Long projectId, Long teamId, Authentication authentication) {
        Project project = findProjectOrThrow(projectId);
        User connectedUser = getConnectedUser(authentication, userRepository);
        authorizeProjectOwner(project, connectedUser);

        Team team = findTeamOrThrow(teamId);

        if (!team.getMembers().contains(connectedUser) && !team.getLeader().equals(connectedUser)) {
            throw new OperationNotPermittedException("You must be a member or leader of the team to assign projects to it");
        }

        if (project.getTeam() != null && !project.getTeam().getId().equals(teamId)) {
            throw new OperationNotPermittedException("Project is already assigned to another team");
        }

        project.assignTeam(team);
        return toDetailDto(projectRepository.save(project));
    }

    public void deleteProject(Long id, Authentication authentication) {
        Project project = findProjectOrThrow(id);
        authorizeProjectOwner(project, getConnectedUser(authentication, userRepository));

        for (User member : new HashSet<>(project.getMembers())) {
            project.removeMember(member);
        }

        project.unassignTeam();

        projectRepository.deleteById(id);
    }

    public ProjectDetailDTO getProjectById(Long id, Authentication authentication) {
        Project project = findProjectOrThrow(id);
        authorizeProjectAccess(project, getConnectedUser(authentication, userRepository));
        return toDetailDto(project);
    }

    public PageResponse<ProjectBasicDTO> getAllProjects(Authentication authentication, int page, int size) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Project> projectPage = projectRepository.findAllDisplayableProjects(pageable, connectedUser.getId());
        Page<ProjectBasicDTO> dtoPage = projectPage.map(projectMapper::toBasicDto);

        return PaginationUtil.buildPageResponse(dtoPage);
    }

    public PageResponse<ProjectBasicDTO> getProjectsByzOwner(Long userId, Authentication authentication, int page, int size) {
        User connectedUser = getConnectedUser(authentication, userRepository);
        if (!userId.equals(connectedUser.getId())) {
            throw new OperationNotPermittedException("Access denied: not your projects");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Project> projectPage = projectRepository.findByOwnerId(userId, pageable);
        Page<ProjectBasicDTO> dtoPage = projectPage.map(projectMapper::toBasicDto);

        return PaginationUtil.buildPageResponse(dtoPage);
    }

    public PageResponse<ProjectBasicDTO> getProjectsByTeam(Long teamId, Authentication authentication, int page, int size) {
        Team team = findTeamOrThrow(teamId);
        User connectedUser = getConnectedUser(authentication, userRepository);


        if (!team.getMembers().contains(connectedUser) && !team.getLeader().equals(connectedUser)) {
            throw new OperationNotPermittedException("Access denied: you are not a member of this team");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Project> projectPage = projectRepository.findByTeamId(teamId, pageable);
        Page<ProjectBasicDTO> dtoPage = projectPage.map(projectMapper::toBasicDto);
        return PaginationUtil.buildPageResponse(dtoPage);
    }

    public ProjectDetailDTO updateProject(Long projectId, ProjectCreateDTO dto, Authentication authentication) {
        Project project = findProjectOrThrow(projectId);
        User connectedUser = getConnectedUser(authentication, userRepository);
        authorizeProjectOwner(project, connectedUser);


        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setDueDate(dto.getDueDate());

        return toDetailDto(projectRepository.save(project));
    }

    public ProjectDetailDTO updateProjectStatus(Long projectId, ProjectStatus newStatus, Authentication authentication) {
        Project project = findProjectOrThrow(projectId);
        authorizeProjectOwner(project, getConnectedUser(authentication, userRepository));

        ProjectStatus currentStatus = project.getStatus();
        if (!isValidProjectStatusTransition(currentStatus, newStatus)) {
            throw new OperationNotPermittedException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        project.setStatus(newStatus);
        return toDetailDto(projectRepository.save(project));
    }


    // --- Helpers ---
    private boolean isValidProjectStatusTransition(ProjectStatus from, ProjectStatus to) {
        return switch (from) {
            case ACTIVE -> to == ProjectStatus.ON_HOLD || to == ProjectStatus.COMPLETED || to == ProjectStatus.CANCELLED;
            case ON_HOLD -> to == ProjectStatus.ACTIVE || to == ProjectStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };
    }

    private Team findTeamOrThrow(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + id));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + id));
    }

    private void authorizeProjectOwner(Project project, User user) {
        if (!project.getOwner().getId().equals(user.getId())) {
            throw new OperationNotPermittedException("You are not the owner of this project");
        }
    }

    private void authorizeProjectAccess(Project project, User user) {
        boolean isMember = project.getMembers().contains(user);
        boolean isOwner = project.getOwner().equals(user);
        boolean isTeamMember = project.getTeam() != null &&
                (project.getTeam().getMembers().contains(user) || project.getTeam().getLeader().equals(user));

        if (!isMember && !isOwner && !isTeamMember) {
            throw new OperationNotPermittedException("You don't have access to this project");
        }
    }
}


