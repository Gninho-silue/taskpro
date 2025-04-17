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
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

import static com.example.taskpro.handler.BusinessErrorCodes.INVALID_TOKEN;
import static com.example.taskpro.handler.SuccessCodes.PASSWORD_RESET_SUCCESS;
import static com.example.taskpro.handler.SuccessCodes.*;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authService;
    private final EmailVerificationService emailService;
    private final UserRepository userRepository;
    private final PasswordResetService resetService;

    @PostMapping("/register")
    public ResponseEntity<SuccessResponse> register(
            @RequestBody @Valid RegisterRequest request
    ) throws MessagingException {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                SuccessResponse.builder()
                        .code(USER_REGISTERED.getCode())
                        .message(USER_REGISTERED.getMessage())
                        .timestamp(LocalDateTime.now())
                        .data(Map.of("email", request.getEmail()))
                        .build()

        );
    }

    @PostMapping("/login")
    public ResponseEntity<SuccessResponse> login(@RequestBody @Valid LoginRequest request) {
        String token = authService.authenticate(request).getToken();
        return ResponseEntity.ok(SuccessResponse.builder()
                .code(USER_LOGGED_IN.getCode())
                .message(USER_LOGGED_IN.getMessage())
                .timestamp(LocalDateTime.now())
                .data(token)
                .build());
    }

    @GetMapping("/confirm")
    public ResponseEntity<SuccessResponse> confirmEmail(@RequestParam("token") String token) {
        emailService.verifyToken(token);
        return ResponseEntity.ok(
                SuccessResponse.builder()
                        .code(EMAIL_VERIFIED.getCode())
                        .message(EMAIL_VERIFIED.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }


    @PostMapping("/request-password-reset")
    public ResponseEntity<SuccessResponse> requestReset(@RequestParam String email) throws MessagingException {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException("User not found with this email: " + email));


        PasswordResetToken token = resetService.createToken(user);
        resetService.sendResetPasswordEmail(user, token.getToken());

        return ResponseEntity.ok(
                SuccessResponse.builder()
                        .code(PASSWORD_RESET_LINK_SENT.getCode())
                        .message(PASSWORD_RESET_LINK_SENT.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        if (!resetService.validateToken(token)) {
            return ResponseEntity.status(UNAUTHORIZED).body(
                    ExceptionResponse.builder()
                            .businessErrorCode(INVALID_TOKEN.getCode())
                            .businessErrorMessage(INVALID_TOKEN.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }

        User user = resetService.getUserByToken(token);
        user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        userRepository.save(user);
        resetService.deleteToken(token);

        return ResponseEntity.ok(
                SuccessResponse.builder()
                        .code(PASSWORD_RESET_SUCCESS.getCode())
                        .message(PASSWORD_RESET_SUCCESS.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }


}
