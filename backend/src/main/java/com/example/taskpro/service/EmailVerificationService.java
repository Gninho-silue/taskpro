package com.example.taskpro.service;

import com.example.taskpro.exception.TokenValidationException;
import com.example.taskpro.model.EmailVerificationToken;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.EmailVerificationTokenRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {


    private final EmailVerificationTokenRepository tokenRepository;
    private final SpringTemplateEngine templateEngine;
    private final JavaMailSender mailSender;

    public EmailVerificationToken createToken(User user) {
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiredAt (LocalDateTime.now().plusHours(24));
        return tokenRepository.save(verificationToken);
    }

    public void verifyToken(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenValidationException("Token is invalid or does not exist"));

        if (verificationToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new TokenValidationException("Token has expired");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);

        verificationToken.setValidatedAt(LocalDateTime.now());
        verificationToken.setToken(null);
        tokenRepository.save(verificationToken);
    }




    @Async
    public void sendEmail(
            String to,
            String username,
            EmailTemplateName emailTemplate,
            String confirmationUrl,
            String activationCode,
            String subject
    ) throws MessagingException {
        String templateName = emailTemplate != null ? emailTemplate.name() : "activate_account";

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage,
                MimeMessageHelper.MULTIPART_MODE_MIXED,
                StandardCharsets.UTF_8.name()
        );

        // Contexte pour Thymeleaf
        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmation_url", confirmationUrl);
        properties.put("activation_code", activationCode);

        Context context = new Context();
        context.setVariables(properties);

        // Configuration de l'email
        helper.setFrom("dev225tech@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);

        // Génération du template à partir du contexte
        String template = templateEngine.process(templateName, context);
        helper.setText(template, true);

        try {
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new MessagingException("Error while sending email", e);
        }
    }

    public void sendValidationEmail(User user) throws MessagingException {
        EmailVerificationToken token = createToken(user);
        String url = "http://localhost:8081/api/v1/auth/confirm?token=" + token.getToken();
        sendEmail(
                user.getEmail(),
                user.fullName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                url,
                token.getToken(),
                "Activation de votre compte"
        );
    }



}

