package com.example.taskpro.controller;

import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        var principal = (User) authentication.getPrincipal();
        return ResponseEntity.ok(
                userRepository.findByEmail(principal.getEmail())
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"))
        );
    }
}

