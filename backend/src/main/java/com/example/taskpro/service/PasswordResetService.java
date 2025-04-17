package com.example.taskpro.service;

import com.example.taskpro.exception.TokenValidationException;
import com.example.taskpro.model.PasswordResetToken;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.PasswordResetTokenRepository;
import com.example.taskpro.repository.UserRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final EmailVerificationService emailService;

    public PasswordResetToken createToken(User user) {
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(2));
        return tokenRepository.save(resetToken);
    }

    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .filter(t -> !t.isExpired())
                .filter(t -> tokenRepository.existsByToken(token))
                .isPresent();
    }

    public void sendResetPasswordEmail(User user, String token) throws MessagingException {
        String url = "http://localhost:8081/api/v1/auth/reset-password?token=" + token;
        emailService.sendEmail(
                user.getEmail(),
                user.fullName(),
                EmailTemplateName.RESET_PASSWORD,
                url,
                token,
                "Réinitialisation de votre mot de passe"
        );
    }

    public User getUserByToken(String token) {
        return tokenRepository.findByToken(token)
                .filter(t -> !t.isExpired())
                .map(PasswordResetToken::getUser)
                .orElseThrow(() -> new TokenValidationException("Token is invalided ou expired"));
    }

    public void deleteToken(String token) {
        tokenRepository.findByToken(token).ifPresent(tokenRepository::delete);
    }
}
