package com.example.taskpro.util;

import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.model.Project;
import com.example.taskpro.model.Task;
import com.example.taskpro.model.Team;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import org.springframework.security.core.Authentication;

public class SecurityUtil {


    public static User getConnectedUser(Authentication authentication, UserRepository userRepository) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }


    public static void authorizeTaskAccess(Task task, User user, String msg) {
        boolean hasAccess = task.getCreator().equals(user) ||
                (task.getAssignee() != null && task.getAssignee().equals(user)) ||
                task.getProject().getMembers().contains(user) ||
                task.getProject().getOwner().equals(user);

        if (!hasAccess) {
            throw new OperationNotPermittedException(msg);
        }

    }

    public  static void authorizeProjectAccess(Project project, User user) {
        boolean isMember = project.getMembers().contains(user);
        boolean isOwner = project.getOwner().equals(user);
        boolean isTeamMember = project.getTeam() != null &&
                (project.getTeam().getMembers().contains(user) || project.getTeam().getLeader().equals(user));

        if (!isMember && !isOwner && !isTeamMember) {
            throw new OperationNotPermittedException("You don't have access to this project");
        }
    }

    public static void authorizeLabelAccess(Project project, User user, String msg) {
        if ((!project.getMembers().contains(user)) && (!project.getOwner().equals(user))) {
            throw new OperationNotPermittedException(msg);
        }
    }



    public static void checkIfCurrentUserIsLeader(Team team, UserRepository userRepository, Authentication authentication) {
        User currentUser = getConnectedUser(authentication, userRepository);
        if (!team.getLeader().getId().equals(currentUser.getId())) {
            throw new SecurityException("Only the team leader can perform this action.");
        }
    }
}
