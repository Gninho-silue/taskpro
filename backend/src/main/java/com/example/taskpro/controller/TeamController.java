package com.example.taskpro.controller;

import com.example.taskpro.dto.team.TeamBasicDTO;
import com.example.taskpro.dto.team.TeamCreateDTO;
import com.example.taskpro.dto.team.TeamDetailDTO;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.service.TeamService;
import com.example.taskpro.util.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("teams")
@RequiredArgsConstructor
public class TeamController extends BaseController {
    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<SuccessResponse> createTeam(
            @RequestBody @Valid TeamCreateDTO request
    ) {
        TeamDetailDTO team = teamService.createTeam(request);
        return createdResponse(team, "Team created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuccessResponse> updateTeam(
            @PathVariable Long id,
            @RequestBody @Valid TeamCreateDTO request,
            Authentication authentication
    ) {
        TeamDetailDTO team = teamService.updateTeam(id, request, authentication);
        return okResponse(team, "Team has been updated successfully");
    }

    @PutMapping("/{id}/leader")
    public ResponseEntity<SuccessResponse> updateTeamLeader(
            @PathVariable Long id,
            @RequestParam Long leaderId,
            Authentication authentication
    ) {
        TeamDetailDTO team = teamService.updateTeamLeader(id, leaderId, authentication);
        return okResponse(team, "Team leader has been updated successfully");
    }

    @PostMapping("/{team-id}/add-member/{user-id}")
    public ResponseEntity<SuccessResponse> addMemberToTeam(
            @PathVariable("team-id") Long teamId,
            @PathVariable("user-id") Long userId,
            Authentication authentication
    ) {
        TeamDetailDTO team = teamService.addMemberToTeam(teamId, userId, authentication);
        return okResponse(team, "Member added successfully");

    }

    @PostMapping("/{team-id}/remove-member/{user-id}")
    public ResponseEntity<SuccessResponse> removeMemberFromTeam(
            @PathVariable("team-id") Long teamId,
            @PathVariable("user-id") Long userId,
            Authentication authentication
    ) {
        TeamDetailDTO team = teamService.removeMemberFromTeam(teamId, userId, authentication);
        return okResponse(team, "Member removed successfully from team");
    }

    @PostMapping("/{team-id}/projects/{project-id}")
    public ResponseEntity<SuccessResponse> assignProjectToTeam(
            @PathVariable("team-id") Long teamId,
            @PathVariable("project-id") Long projectId,
            Authentication authentication
    ) {
        TeamDetailDTO team = teamService.assignProjectToTeam(teamId, projectId, authentication);
        return okResponse(team, "Project assigned successfully to team");
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse> getTeam(@PathVariable Long id) {
        TeamDetailDTO team = teamService.getTeam(id);
        return okResponse(team, "Team fetched successfully");
    }

    @GetMapping
    public ResponseEntity<SuccessResponse> getAllTeams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<TeamBasicDTO> teams = teamService.getAllTeams(page, size);
        return okResponse(teams, "Teams fetched successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SuccessResponse> deleteTeam(
            @PathVariable Long id,
            Authentication authentication
    ) {
        teamService.deleteTeam(id, authentication);
        return okResponse(null, "Team deleted successfully");
    }
}