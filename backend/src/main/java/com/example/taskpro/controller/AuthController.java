package com.example.taskpro.controller;

import com.example.taskpro.dto.LoginRequest;
import com.example.taskpro.dto.RegisterRequest;
import com.example.taskpro.exception.EmailNotFoundException;
import com.example.taskpro.handler.ExceptionResponse;
import com.example.taskpro.handler.SuccessResponse;
import com.example.taskpro.model.PasswordResetToken;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.service.AuthenticationService;
import com.example.taskpro.service.EmailVerificationService;
import com.example.taskpro.service.PasswordResetService;
import com.example.taskpro.util.PasswordValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

import static com.example.taskpro.handler.BusinessErrorCodes.INVALID_TOKEN;
import static com.example.taskpro.handler.SuccessCodes.*;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Slf4j
@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API pour l'authentification et la gestion des comptes utilisateurs")
public class AuthController {

    private final AuthenticationService authService;
    private final EmailVerificationService emailService;
    private final UserRepository userRepository;
    private final PasswordResetService resetService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;

    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur",
            description = "Crée un nouveau compte utilisateur et envoie un email de vérification")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "409", description = "Email déjà utilisé")
    })
    public ResponseEntity<SuccessResponse> register(
            @RequestBody @Valid RegisterRequest request
    ) throws MessagingException {

        log.info("Tentative d'inscription pour l'email: {}", request.getEmail());

        // Validation du mot de passe
        PasswordValidator.PasswordValidationResult passwordResult = passwordValidator.validate(request.getPassword());
        if (!passwordResult.valid()) {
            log.warn("Mot de passe invalide pour l'email: {}", request.getEmail());
            throw new IllegalArgumentException(passwordResult.getErrorMessage());
        }

        authService.register(request);

        log.info("Inscription réussie pour l'email: {}", request.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                SuccessResponse.builder()
                        .code(USER_REGISTERED.getCode())
                        .message(USER_REGISTERED.getMessage())
                        .timestamp(LocalDateTime.now())
                        .data(Map.of(
                                "email", request.getEmail(),
                                "message", "Please check your email to verify your account"
                        ))
                        .build()
        );
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur",
            description = "Authentifie un utilisateur et retourne un token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Connexion réussie"),
            @ApiResponse(responseCode = "401", description = "Identifiants invalides"),
            @ApiResponse(responseCode = "403", description = "Compte désactivé")
    })
    public ResponseEntity<SuccessResponse> login(@RequestBody @Valid LoginRequest request) {

        log.info("Tentative de connexion pour l'email: {}", request.getEmail());

        String token = authService.authenticate(request).getToken();

        log.info("Connexion réussie pour l'email: {}", request.getEmail());

        return ResponseEntity.ok(SuccessResponse.builder()
                .code(USER_LOGGED_IN.getCode())
                .message(USER_LOGGED_IN.getMessage())
                .timestamp(LocalDateTime.now())
                .data(Map.of(
                        "token", token,
                        "tokenType", "Bearer"
                ))
                .build());
    }

    @GetMapping("/activate-account")
    @Operation(summary = "Confirmation d'email",
            description = "Vérifie le token de confirmation d'email et active le compte utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Compte activé avec succès"),
            @ApiResponse(responseCode = "400", description = "Token invalide ou expiré")
    })
    public ResponseEntity<SuccessResponse> confirmEmail(@RequestParam("token") String token) {

        log.info("Tentative de confirmation d'email avec token");

        emailService.verifyToken(token);

        log.info("Confirmation d'email réussie");

        return ResponseEntity.ok(
                SuccessResponse.builder()
                        .code(EMAIL_VERIFIED.getCode())
                        .message(EMAIL_VERIFIED.getMessage())
                        .timestamp(LocalDateTime.now())
                        .data(Map.of("message", "Your account has been successfully activated"))
                        .build()
        );
    }

    @PostMapping("/request-password-reset")
    @Operation(summary = "Demande de réinitialisation de mot de passe",
            description = "Envoie un email avec un lien de réinitialisation de mot de passe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email de réinitialisation envoyé"),
            @ApiResponse(responseCode = "404", description = "Email non trouvé")
    })
    public ResponseEntity<SuccessResponse> requestReset(@RequestParam String email) throws MessagingException {

        log.info("Demande de réinitialisation de mot de passe pour: {}", email);

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("User not found with this email: " + email));

        PasswordResetToken token = resetService.createToken(user);
        resetService.sendResetPasswordEmail(user, token.getToken());

        log.info("Email de réinitialisation envoyé pour: {}", email);

        return ResponseEntity.ok(
                SuccessResponse.builder()
                        .code(PASSWORD_RESET_LINK_SENT.getCode())
                        .message(PASSWORD_RESET_LINK_SENT.getMessage())
                        .timestamp(LocalDateTime.now())
                        .data(Map.of(
                                "email", email,
                                "message", "Password reset link sent to your email"
                        ))
                        .build()
        );
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Réinitialisation de mot de passe",
            description = "Réinitialise le mot de passe d'un utilisateur avec un token valide")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mot de passe réinitialisé avec succès"),
            @ApiResponse(responseCode = "400", description = "Token invalide ou mot de passe faible"),
            @ApiResponse(responseCode = "401", description = "Token expiré")
    })
    public ResponseEntity<?> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {

        log.info("Tentative de réinitialisation de mot de passe");

        if (!resetService.validateToken(token)) {
            log.warn("Token de réinitialisation invalide");
            return ResponseEntity.status(UNAUTHORIZED).body(
                    ExceptionResponse.builder()
                            .businessErrorCode(INVALID_TOKEN.getCode())
                            .businessErrorMessage(INVALID_TOKEN.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }

        // Validation du nouveau mot de passe
        PasswordValidator.PasswordValidationResult passwordResult = passwordValidator.validate(newPassword);
        if (!passwordResult.valid()) {
            log.warn("New password validation failed");
            return ResponseEntity.badRequest().body(
                    ExceptionResponse.builder()
                            .businessErrorCode(400)
                            .businessErrorMessage("Password validation failed: " + passwordResult.getErrorMessage())
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }

        User user = resetService.getUserByToken(token);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetService.deleteToken(token);

        log.info("Mot de passe réinitialisé avec succès pour: {}", user.getEmail());

        return ResponseEntity.ok(
                SuccessResponse.builder()
                        .code(PASSWORD_RESET_SUCCESS.getCode())
                        .message(PASSWORD_RESET_SUCCESS.getMessage())
                        .timestamp(LocalDateTime.now())
                        .data(Map.of("message", "Your password has been successfully reset"))
                        .build()
        );
    }
}