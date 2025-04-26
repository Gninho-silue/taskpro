package com.example.taskpro.util;

import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;

public class SecurityUtil {
    public static User getConnectedUser(Authentication authentication, UserRepository userRepository) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Connected user not found"));
    }
}
