package com.example.taskpro.controller;

import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.dto.user.UserCreateDTO;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.model.Role;
import com.example.taskpro.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User management API")
@SecurityRequirement(name = "bearerAuth")
public class UserController extends BaseController{

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Fetched user by ID")
    public ResponseEntity<SuccessResponse> getUserById(@PathVariable Long id) {
        return okResponse(userService.getUserById(id), "User fetched successfully");
    }

    @GetMapping("/by-email")
    @Operation(summary = "Retrieved user by email")
    public ResponseEntity<SuccessResponse> getUserByEmail(@RequestParam String email) {
        return okResponse(userService.getUserByEmail(email), "User fetched successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<UserBasicDTO> getCurrentUser(Authentication authentication) {
        UserBasicDTO user = userService.getCurrentUser(authentication);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user's informations")
    public ResponseEntity<SuccessResponse> updateUser(
            @PathVariable Long id, 
            @RequestBody @Valid UserCreateDTO request
    ) {
        return okResponse(userService.updateUser(id, request), "User updated successfully");
    }

    @PatchMapping("/{id}/disable")
    @Operation(summary = "Disable user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> disableUser(
            @PathVariable Long id,
            @RequestParam boolean disabled,
            Authentication authentication
    ) {
        userService.setAccountDisable(id,disabled, authentication);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/lock")
    @Operation(summary = "Lock or unlock a user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> setAccountLock(
            @PathVariable Long id, 
            @RequestParam boolean locked) {
        userService.setAccountLock(id, locked);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search users")
    public ResponseEntity<SuccessResponse> searchUsers(@RequestParam String query) {
        List<UserBasicDTO> users = userService.searchUsers(query);
        return okResponse(users, "Users fetched successfully");
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Change user role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> changeUserRole(
            @PathVariable Long id, 
            @RequestParam Role newRole,
            Authentication authentication

            ) {
        userService.changeUserRole(id, newRole, authentication);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/language")
    @Operation(summary = "Update language preferences")
    public ResponseEntity<SuccessResponse> updateLanguagePreference(
            @PathVariable Long id, 
            @RequestParam String language) {
        userService.updateLanguagePreference(id, language);
        return okResponse("No Content", "Language preference updated successfully");
    }
}