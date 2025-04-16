package com.example.taskpro.controller;

import com.example.taskpro.dto.AuthenticationResponse;
import com.example.taskpro.dto.LoginRequest;
import com.example.taskpro.dto.RegisterRequest;
import com.example.taskpro.model.PasswordResetToken;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.service.AuthenticationService;
import com.example.taskpro.service.EmailVerificationService;
import com.example.taskpro.service.PasswordResetService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authService;
    private final EmailVerificationService emailService;
    private final UserRepository userRepository;
    private final PasswordResetService resetService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody @Valid RegisterRequest request) throws MessagingException {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @GetMapping("/confirm")
    public ResponseEntity<String> confirmEmail(@RequestParam("token") String token) {
        boolean isTokenValid = emailService.verifyToken(token);

        if (isTokenValid) {
            return ResponseEntity.ok("Votre email a été confirmé avec succès !");
        } else {
            return ResponseEntity.badRequest().body("Le token est invalid ou a expiré.");
        }
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<String> requestReset(@RequestParam String email) throws MessagingException {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PasswordResetToken token = resetService.createToken(user);
        resetService.sendResetPasswordEmail(user, token.getToken());

        return ResponseEntity.ok("A Reset password link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        if (!resetService.validateToken(token)) {
            return ResponseEntity.badRequest().body("Token invalided or expired");
        }

        User user = resetService.getUserByToken(token);
        user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        userRepository.save(user);
        resetService.deleteToken(token);

        return ResponseEntity.ok("Password has successfully been reset !");
    }


}
