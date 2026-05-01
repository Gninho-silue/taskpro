package com.example.taskpro.service;

import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.team.TeamBasicDTO;
import com.example.taskpro.dto.team.TeamCreateDTO;
import com.example.taskpro.dto.team.TeamDetailDTO;
import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.mapper.TeamMapper;
import com.example.taskpro.model.Project;
import com.example.taskpro.model.Team;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.ProjectRepository;
import com.example.taskpro.repository.TeamRepository;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.util.PageResponse;
import com.example.taskpro.util.PaginationUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.stream.Collectors;

import static com.example.taskpro.util.SecurityUtil.checkIfCurrentUserIsLeader;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;
    private final ProjectRepository projectRepository;

    public TeamDetailDTO toDetailDto(Team team) {
        if (team == null) return null;

        TeamDetailDTO dto = new TeamDetailDTO();
        BeanUtils.copyProperties(teamMapper.toBasicDto(team), dto);

        if (team.getLeader() != null) {
            dto.setLeader(new UserBasicDTO(
                    team.getLeader().getId(),
                    team.getLeader().getFirstname(),
                    team.getLeader().getLastname(),
                    team.getLeader().getEmail()
            ));
        }

        dto.setMembers(new ArrayList<>(team.getMembers()).stream()
                .map(user -> new UserBasicDTO(
                        user.getId(),
                        user.getFirstname(),
                        user.getLastname(),
                        user.getEmail()
                ))
                .collect(Collectors.toSet()));

        dto.setProjects(new ArrayList<>(team.getProjects()).stream()
                .map(project -> new ProjectBasicDTO(
                        project.getId(),
                        project.getName(),
                        project.getDescription(),
                        project.getStatus(),
                        project.getDueDate(),
                        project.getStartDate()
                ))
                .collect(Collectors.toSet()));

        return dto;
    }


    public TeamDetailDTO createTeam(TeamCreateDTO request) {

        User leader = findUserOrThrow(request.getLeaderId());

        Team team = Team.builder()
                .name(request.getName())
                .description(request.getDescription())
                .leader(leader)
                .members(new HashSet<>())
                .projects(new HashSet<>())
                .build();

        team = teamRepository.save(team);

        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            for (Long memberId : request.getMemberIds()) {
                User member = findUserOrThrow(memberId);
                team.addMember(member);
                userRepository.save(member);
            }
        }

        if (!team.getMembers().contains(leader)) {
            team.addMember(leader);
            userRepository.save(leader);
        }

        team = teamRepository.save(team);

        return toDetailDto(team);
    }

    public TeamDetailDTO updateTeam(Long id, TeamCreateDTO request, Authentication authentication) {
        Team team = findTeamOrThrow(id);
        checkIfCurrentUserIsLeader(team, userRepository, authentication);

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        
        return toDetailDto(teamRepository.save(team));
    }

    public TeamDetailDTO updateTeamLeader(Long id, Long newLeaderId, Authentication authentication) {
        Team team = findTeamOrThrow(id);
        checkIfCurrentUserIsLeader(team, userRepository, authentication);

        User newLeader = findUserOrThrow(newLeaderId);
        team.setLeader(newLeader);

        if (!team.getMembers().contains(newLeader)) {
            team.addMember(newLeader);
            userRepository.save(newLeader);
        }

        return toDetailDto(teamRepository.save(team));
    }

    public TeamDetailDTO addMemberToTeam(Long teamId, Long userId, Authentication authentication) {
        Team team = findTeamOrThrow(teamId);
        checkIfCurrentUserIsLeader(team, userRepository, authentication);

        User user = findUserOrThrow(userId);

        if (team.getMembers().contains(user)) {
            throw new OperationNotPermittedException("User is already a member of this team");
        }

        team.addMember(user);

        userRepository.save(user);
        teamRepository.save(team);

        return toDetailDto(team);
    }

    public TeamDetailDTO removeMemberFromTeam(Long teamId, Long userId, Authentication authentication) {
        Team team = findTeamOrThrow(teamId);
        checkIfCurrentUserIsLeader(team, userRepository, authentication);

        User user = findUserOrThrow(userId);

        if (team.getLeader().equals(user)) {
            throw new OperationNotPermittedException("Cannot remove team leader from team");
        }

        if (!team.getMembers().contains(user)) {
            throw new OperationNotPermittedException("User is not a member of this team");
        }

        for (Project project : new HashSet<>(team.getProjects())) {
            if (project.getMembers().contains(user)) {
                project.getMembers().remove(user);
                user.getProjects().remove(project);
                projectRepository.save(project);
            }
        }

        team.removeMember(user);

        userRepository.save(user);
        teamRepository.save(team);

        return toDetailDto(team);
    }

    public TeamDetailDTO assignProjectToTeam(Long teamId, Long projectId, Authentication authentication) {
        Team team = findTeamOrThrow(teamId);
        checkIfCurrentUserIsLeader(team, userRepository, authentication);

        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (project.getTeam() != null && !project.getTeam().equals(team)) {
            throw new OperationNotPermittedException("Project is already assigned to another team");
        }

        project.setTeam(team);
        team.getProjects().add(project);
        projectRepository.save(project);

        return toDetailDto(team);
    }

    public TeamDetailDTO getTeam(Long id) {
        return toDetailDto(findTeamOrThrow(id));
    }

    public PageResponse<TeamDetailDTO> getAllTeams(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var pageResult = teamRepository.findAll(pageable).map(this::toDetailDto);
        return PaginationUtil.buildPageResponse(pageResult);
    }

    public void deleteTeam(Long id, Authentication authentication) {
        Team team = findTeamOrThrow(id);
        checkIfCurrentUserIsLeader(team, userRepository, authentication);

        for (User member : new HashSet<>(team.getMembers())) {
            team.removeMember(member);
            userRepository.save(member);
        }


        for (Project project : new HashSet<>(team.getProjects())) {
            project.setTeam(null);
            projectRepository.save(project);
        }

        teamRepository.deleteById(id);
    }


    // === Private utils ===
    private Team findTeamOrThrow(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }


}