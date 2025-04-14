package com.example.taskpro.service;

import com.example.taskpro.dto.AuthenticationResponse;
import com.example.taskpro.dto.LoginRequest;
import com.example.taskpro.dto.RegisterRequest;
import com.example.taskpro.model.Role;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists.");
        }
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .username(request.getFirstname()+ request.getLastname())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = (User) authentication.getPrincipal();
        var claims = new HashMap<String, Object>();
        claims.put("fullName", user.fullName());
        String jwtToken = jwtService.generateToken(claims, user);


        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
