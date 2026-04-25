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
import com.example.taskpro.util.PasswordValidator;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationService emailService;
    private final PasswordValidator passwordValidator;

    public void register(RegisterRequest request) throws MessagingException {
        log.info("Starting user registration for email: {}", request.getEmail());
        
        // Validation du mot de passe
        PasswordValidator.PasswordValidationResult passwordResult = passwordValidator.validate(request.getPassword());
        if (!passwordResult.valid()) {
            log.warn("Password validation failed for email: {}", request.getEmail());
            throw new IllegalArgumentException("Password validation failed: " + passwordResult.getErrorMessage());
        }
        
        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration attempt with existing email: {}", request.getEmail());
            throw new EmailAlreadyExistsException("User with this email already exists.");
        }
        
        // Créer l'utilisateur
        var user = User.builder()
                .firstname(request.getFirstname().trim())
                .lastname(request.getLastname().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .dateOfBirth(request.getDateOfBirth())
                .accountLocked(false)
                .preferredLanguage("en")
                .enabled(false) // Compte désactivé jusqu'à vérification email
                .role(Role.USER)
                .build();
        
        userRepository.save(user);
        log.info("User created successfully with ID: {}", user.getId());
        
        // Envoyer l'email de vérification
        emailService.sendValidationEmail(user);
        log.info("Verification email sent to: {}", request.getEmail());
    }

    @Transactional(readOnly = true)
    public AuthenticationResponse authenticate(LoginRequest request) {
        log.info("Authentication attempt for email: {}", request.getEmail());
        
        // Vérifier si l'utilisateur existe
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Authentication failed - user not found: {}", request.getEmail());
                    return new EmailNotFoundException("No user found with email: " + request.getEmail());
                });

        // Vérifier si le compte est activé
        if (!user.isEnabled()) {
            log.warn("Authentication failed - account not verified: {}", request.getEmail());
            throw new AccountNotVerifiedException("Your account is not verified yet. Please check your email.");
        }

        // Vérifier si le compte est verrouillé
        if (user.isAccountLocked()) {
            log.warn("Authentication failed - account locked: {}", request.getEmail());
            throw new BadCredentialsException("Account is locked. Please contact administrator.");
        }

        try {
            // Authentification
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            var authenticatedUser = (User) authentication.getPrincipal();
            
            // Générer le token JWT avec des claims personnalisés
            var claims = new HashMap<String, Object>();
            claims.put("fullName", authenticatedUser.fullName());
            claims.put("role", authenticatedUser.getRole().name());
            claims.put("userId", authenticatedUser.getId());
            
            String jwtToken = jwtService.generateToken(claims, authenticatedUser);
            
            // Mettre à jour la dernière connexion
            authenticatedUser.setLastLogin(LocalDateTime.now());
            userRepository.save(authenticatedUser);
            
            log.info("Authentication successful for user: {}", request.getEmail());
            
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .build();
                    
        } catch (Exception e) {
            log.warn("Authentication failed for email: {} - {}", request.getEmail(), e.getMessage());
            throw new BadCredentialsException("Invalid credentials");
        }
    }



}
