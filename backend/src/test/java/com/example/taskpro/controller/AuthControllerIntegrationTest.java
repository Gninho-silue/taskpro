package com.example.taskpro.controller;

import com.example.taskpro.dto.LoginRequest;
import com.example.taskpro.dto.RegisterRequest;
import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.service.AuthenticationService;
import com.example.taskpro.service.EmailVerificationService;
import com.example.taskpro.service.PasswordResetService;
import com.example.taskpro.util.PasswordValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour AuthController
 * Teste les endpoints d'authentification avec MockMvc
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationService authenticationService;

    @MockBean
    private EmailVerificationService emailVerificationService;

    @MockBean
    private PasswordResetService passwordResetService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordValidator passwordValidator;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;

    @BeforeEach
    void setUp() {
        // Setup valid register request
        validRegisterRequest = RegisterRequest.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("StrongPass078!")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build();

        // Setup valid login request
        validLoginRequest = LoginRequest.builder()
                .email("john.doe@example.com")
                .password("StrongPass087!")
                .build();
    }

    @Test
    @DisplayName("Should register user successfully with valid data")
    void shouldRegisterUserSuccessfullyWithValidData() throws Exception {
        // Given
        doNothing().when(authenticationService).register(any(RegisterRequest.class));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.data.message").value("Please check your email to verify your account"));

        verify(authenticationService).register(any(RegisterRequest.class));
    }

    @Test
    @DisplayName("Should return 400 when register request is invalid")
    void shouldReturn400WhenRegisterRequestIsInvalid() throws Exception {
        // Given
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .firstname("") // Empty firstname
                .lastname("Doe")
                .email("invalid-email") // Invalid email
                .password("weak") // Weak password
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should login user successfully with valid credentials")
    void shouldLoginUserSuccessfullyWithValidCredentials() throws Exception {
        // Given
        when(authenticationService.authenticate(any(LoginRequest.class)))
                .thenReturn(com.example.taskpro.dto.AuthenticationResponse.builder()
                        .token("jwt-token")
                        .build());

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value("jwt-token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));

        verify(authenticationService).authenticate(any(LoginRequest.class));
    }

    @Test
    @DisplayName("Should return 400 when login request is invalid")
    void shouldReturn400WhenLoginRequestIsInvalid() throws Exception {
        // Given
        LoginRequest invalidRequest = LoginRequest.builder()
                .email("invalid-email")
                .password("") // Empty password
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 when login request has weak password")
    void shouldReturn400WhenLoginRequestHasWeakPassword() throws Exception {
        // Given
        LoginRequest weakPasswordRequest = LoginRequest.builder()
                .email("john.doe@example.com")
                .password("weak") // Too short
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(weakPasswordRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should confirm email successfully with valid token")
    void shouldConfirmEmailSuccessfullyWithValidToken() throws Exception {
        // Given
        doNothing().when(emailVerificationService).verifyToken(anyString());

        // When & Then
        mockMvc.perform(post("/api/v1/auth/activate-account")
                        .param("token", "valid-token"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Email verified successfully"))
                .andExpect(jsonPath("$.data.message").value("Your account has been successfully activated"));

        verify(emailVerificationService).verifyToken("valid-token");
    }

    @Test
    @DisplayName("Should request password reset successfully")
    void shouldRequestPasswordResetSuccessfully() throws Exception {
        // Given
        doNothing().when(passwordResetService).createToken(any());
        doNothing().when(passwordResetService).sendResetPasswordEmail(any(), anyString());

        // When & Then
        mockMvc.perform(post("/api/v1/auth/request-password-reset")
                        .param("email", "john.doe@example.com"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(305))
                .andExpect(jsonPath("$.message").value("Password reset link sent"))
                .andExpect(jsonPath("$.data.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.data.message").value("Password reset link sent to your email"));
    }

    @Test
    @DisplayName("Should reset password successfully with valid token")
    void shouldResetPasswordSuccessfullyWithValidToken() throws Exception {
        // Given
        when(passwordResetService.validateToken(anyString())).thenReturn(true);
        when(passwordResetService.getUserByToken(anyString())).thenReturn(any());
        doNothing().when(passwordResetService).deleteToken(anyString());

        // When & Then
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .param("token", "valid-token")
                        .param("newPassword", "NewStrongPass123!"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(306))
                .andExpect(jsonPath("$.message").value("Password reset successfully"))
                .andExpect(jsonPath("$.data.message").value("Your password has been successfully reset"));

        verify(passwordResetService).validateToken("valid-token");
        verify(passwordResetService).deleteToken("valid-token");
    }

    @Test
    @DisplayName("Should return 401 when reset password with invalid token")
    void shouldReturn401WhenResetPasswordWithInvalidToken() throws Exception {
        // Given
        when(passwordResetService.validateToken(anyString())).thenReturn(false);

        // When & Then
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .param("token", "invalid-token")
                        .param("newPassword", "NewStrongPass123!"))
                .andDo(print())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.businessErrorCode").value(307))
                .andExpect(jsonPath("$.businessErrorMessage").value("Invalid or expired token"));

        verify(passwordResetService).validateToken("invalid-token");
        verify(passwordResetService, never()).deleteToken(anyString());
    }

    @Test
    @DisplayName("Should return 400 when reset password with weak new password")
    void shouldReturn400WhenResetPasswordWithWeakNewPassword() throws Exception {
        // Given
        when(passwordResetService.validateToken(anyString())).thenReturn(true);
        when(passwordValidator.validate(anyString())).thenReturn(
                new com.example.taskpro.util.PasswordValidator.PasswordValidationResult(
                        false, java.util.List.of("Password too weak")));

        // When & Then
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .param("token", "valid-token")
                        .param("newPassword", "weak"))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.businessErrorCode").value(400))
                .andExpect(jsonPath("$.businessErrorMessage").value("Password validation failed: Password too weak"));

        verify(passwordResetService).validateToken("valid-token");
        verify(passwordValidator).validate("weak");
    }

    @Test
    @DisplayName("Should handle missing required parameters")
    void shouldHandleMissingRequiredParameters() throws Exception {
        // When & Then - Missing email parameter
        mockMvc.perform(post("/api/v1/auth/request-password-reset"))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // When & Then - Missing token parameter
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .param("newPassword", "NewStrongPass123!"))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // When & Then - Missing newPassword parameter
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .param("token", "valid-token"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should handle malformed JSON requests")
    void shouldHandleMalformedJsonRequests() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andDo(print())
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
