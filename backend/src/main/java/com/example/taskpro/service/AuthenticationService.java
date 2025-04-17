package com.example.taskpro.service;

import com.example.taskpro.dto.AuthenticationResponse;
import com.example.taskpro.dto.LoginRequest;
import com.example.taskpro.dto.RegisterRequest;
import com.example.taskpro.exception.AccountNotVerifiedException;
import com.example.taskpro.exception.EmailAlreadyExistsException;
import com.example.taskpro.exception.EmailNotFoundException;
import com.example.taskpro.model.Role;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.security.JwtService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationService emailService;

    public void register(RegisterRequest request) throws MessagingException {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("User with this email already exists.");
        }
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .dateOfBirth(request.getDateOfBirth())
                .accountLocked(false)
                .enabled(false)
                .role(Role.USER)
                .build();
        userRepository.save(user);
        emailService.sendValidationEmail(user);

        var jwtToken = jwtService.generateToken(user);
        AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EmailNotFoundException("No user found with email: " + request.getEmail()));

        if (!user.isEnabled()) {
            throw new AccountNotVerifiedException("Your account is not verified yet. Please check your email.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var authenticateUser = (User) authentication.getPrincipal();
        var claims = new HashMap<String, Object>();
        claims.put("fullName", user.fullName());
        String jwtToken = jwtService.generateToken(claims, authenticateUser);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(authenticateUser);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }



}
