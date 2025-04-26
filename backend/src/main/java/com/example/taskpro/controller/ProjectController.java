package com.example.taskpro.controller;

import com.example.taskpro.dto.project.ProjectBasicDTO;
import com.example.taskpro.dto.project.ProjectCreateDTO;
import com.example.taskpro.dto.project.ProjectDetailDTO;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.model.ProjectStatus;
import com.example.taskpro.service.ProjectService;
import com.example.taskpro.util.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("projects")
@RequiredArgsConstructor
public class ProjectController extends BaseController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<SuccessResponse> createProject(
            @RequestBody @Valid ProjectCreateDTO request,
            Authentication authentication
    ) {
        ProjectDetailDTO project = projectService.createProject(request, authentication);
        return createdResponse(project, "Project created successfully.");

    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse> getProject(
            @PathVariable Long id,
            Authentication authentication
    ) {
        ProjectDetailDTO project = projectService.getProjectById(id, authentication);
        return  okResponse(project, "Project fetched successfully");

    }

    @GetMapping
    public ResponseEntity<SuccessResponse> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PageResponse<ProjectBasicDTO> projects = projectService.getAllProjects(authentication, page, size);
        return okResponse(projects, "Projects retrieved successfully");

    }

    @GetMapping("/owner/{user-id}")
    public ResponseEntity<SuccessResponse> getProjectsByUser(
            @PathVariable("user-id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PageResponse<ProjectBasicDTO> projects = projectService.getProjectsByzOwner(userId, authentication, page, size);
        return okResponse(projects, "Projects retrieved successfully.");

    }

    @GetMapping("/team/{team-id}")
    public ResponseEntity<SuccessResponse> getProjectsByTeam(
            @PathVariable("team-id") Long teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PageResponse<ProjectBasicDTO> projects = projectService.getProjectsByTeam(teamId, authentication, page, size);
        return okResponse(projects, "Projects retrieved successfully.");

    }

    @PatchMapping("/{id}")
    public ResponseEntity<SuccessResponse> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectCreateDTO request,
            Authentication authentication
    ) {
        ProjectDetailDTO project = projectService.updateProject(id, request, authentication);
        return okResponse(project, "Project has been updated successfully.");

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SuccessResponse> deleteProject(
            @PathVariable Long id,
            Authentication authentication
    ) {
        projectService.deleteProject(id, authentication);
        return okResponse(null, "Project deleted successfully.");

    }

    @PutMapping("/{project-id}/assign-team/{team-id}")
    public ResponseEntity<SuccessResponse> assignProjectToTeam(
            @PathVariable("project-id") Long projectId,
            @PathVariable("team-id") Long teamId,
            Authentication authentication
    ) {
        ProjectDetailDTO project = projectService.assignProjectToTeam(projectId, teamId, authentication);
        return createdResponse(project, "Project successfully assigned to team.");

    }

    @PutMapping("/{project-id}/add-member")
    public ResponseEntity<SuccessResponse> addMemberToProject(
            @PathVariable("project-id") Long projectId,
            @RequestParam Long userId,
            Authentication authentication
    ) {
        ProjectDetailDTO project = projectService.addMemberToProject(projectId, userId, authentication);
        return okResponse(project, "Project added successfully.");

    }

    @PutMapping("/{project-id}/remove-member")
    public ResponseEntity<SuccessResponse> removeMemberFromProject(
            @PathVariable("project-id") Long projectId,
            @RequestParam Long userId,
            Authentication authentication
    ) {
        ProjectDetailDTO project = projectService.removeMemberFromProject(projectId, userId, authentication);
        return okResponse(project, "Member has been successfully removed from the project.");

    }

    @PutMapping("/{project-id}/status")
    public ResponseEntity<SuccessResponse> updateStatus(
            @PathVariable("project-id") Long projectId,
            @RequestParam ProjectStatus newStatus,
            Authentication authentication
    ) {
        ProjectDetailDTO project = projectService.updateProjectStatus(projectId, newStatus, authentication);
        return okResponse(project, "Project status has been updated successfully to " + newStatus);

    }
}