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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour AuthenticationService
 * Couvre tous les scénarios d'authentification et d'inscription
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private PasswordValidator passwordValidator;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private PasswordValidator.PasswordValidationResult validPasswordResult;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(1L)
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("encodedPassword")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .accountLocked(false)
                .preferredLanguage("en")
                .enabled(true)
                .role(Role.USER)
                .lastLogin(LocalDateTime.now())
                .build();

        // Setup register request
        registerRequest = RegisterRequest.builder()
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("StrongPass123!")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build();

        // Setup login request
        loginRequest = LoginRequest.builder()
                .email("john.doe@example.com")
                .password("StrongPass123!")
                .build();

        // Setup valid password result
        validPasswordResult = new PasswordValidator.PasswordValidationResult(true, null);
    }

    @Test
    @DisplayName("Should register user successfully with valid data")
    void shouldRegisterUserSuccessfullyWithValidData() throws Exception {
        // Given
        when(passwordValidator.validate(anyString())).thenReturn(validPasswordResult);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailVerificationService).sendValidationEmail(any(User.class));

        // When
        authenticationService.register(registerRequest);

        // Then
        verify(passwordValidator).validate("StrongPass123!");
        verify(userRepository).findByEmail("john.doe@example.com");
        verify(passwordEncoder).encode("StrongPass123!");
        verify(userRepository).save(any(User.class));
        verify(emailVerificationService).sendValidationEmail(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with existing email")
    void shouldThrowExceptionWhenRegisteringWithExistingEmail() throws Exception {
        // Given
        when(passwordValidator.validate(anyString())).thenReturn(validPasswordResult);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // When & Then
        EmailAlreadyExistsException exception = assertThrows(
                EmailAlreadyExistsException.class,
                () -> authenticationService.register(registerRequest)
        );

        assertEquals("User with this email already exists.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when password validation fails")
    void shouldThrowExceptionWhenPasswordValidationFails() {
        // Given
        PasswordValidator.PasswordValidationResult invalidResult =
                new PasswordValidator.PasswordValidationResult(false,
                        java.util.List.of("Password too weak"));
        when(passwordValidator.validate(anyString())).thenReturn(invalidResult);

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authenticationService.register(registerRequest)
        );

        assertTrue(exception.getMessage().contains("Password validation failed"));
        verify(userRepository, never()).findByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should authenticate user successfully with valid credentials")
    void shouldAuthenticateUserSuccessfullyWithValidCredentials() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        Authentication mockAuthentication = mock(Authentication.class);
        when(mockAuthentication.getPrincipal()).thenReturn(testUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);

        when(jwtService.generateToken(anyMap(), any(UserDetails.class))).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        AuthenticationResponse response = authenticationService.authenticate(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        verify(userRepository).findByEmail("john.doe@example.com");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(anyMap(), eq(testUser));
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when user not found during login")
    void shouldThrowExceptionWhenUserNotFoundDuringLogin() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        EmailNotFoundException exception = assertThrows(
                EmailNotFoundException.class,
                () -> authenticationService.authenticate(loginRequest)
        );

        assertEquals("No user found with email: john.doe@example.com", exception.getMessage());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should throw exception when account is not verified")
    void shouldThrowExceptionWhenAccountIsNotVerified() {
        // Given
        testUser.setEnabled(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // When & Then
        AccountNotVerifiedException exception = assertThrows(
                AccountNotVerifiedException.class,
                () -> authenticationService.authenticate(loginRequest)
        );

        assertEquals("Your account is not verified yet. Please check your email.", exception.getMessage());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should throw exception when account is locked")
    void shouldThrowExceptionWhenAccountIsLocked() {
        // Given
        testUser.setAccountLocked(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // When & Then
        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authenticationService.authenticate(loginRequest)
        );

        assertEquals("Account is locked. Please contact administrator.", exception.getMessage());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should throw exception when authentication fails")
    void shouldThrowExceptionWhenAuthenticationFails() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // When & Then
        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authenticationService.authenticate(loginRequest)
        );

        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    @DisplayName("Should trim and normalize email during registration")
    void shouldTrimAndNormalizeEmailDuringRegistration() throws Exception {
        // Given
        RegisterRequest requestWithSpaces = RegisterRequest.builder()
                .firstname("  John  ")
                .lastname("  Doe  ")
                .email("  JOHN.DOE@EXAMPLE.COM  ")
                .password("StrongPass123!")
                .build();

        when(passwordValidator.validate(anyString())).thenReturn(validPasswordResult);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(emailVerificationService).sendValidationEmail(any(User.class));

        // When
        authenticationService.register(requestWithSpaces);

        // Then
        verify(userRepository).findByEmail("john.doe@example.com"); // Should be trimmed and lowercased
    }

    @Test
    @DisplayName("Should set user as disabled during registration")
    void shouldSetUserAsDisabledDuringRegistration() throws Exception {
        // Given
        when(passwordValidator.validate(anyString())).thenReturn(validPasswordResult);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertFalse(user.isEnabled()); // Should be disabled until email verification
            return user;
        });
        doNothing().when(emailVerificationService).sendValidationEmail(any(User.class));

        // When
        authenticationService.register(registerRequest);

        // Then
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should include custom claims in JWT token")
    void shouldIncludeCustomClaimsInJwtToken() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        Authentication mockAuthentication = mock(Authentication.class);
        when(mockAuthentication.getPrincipal()).thenReturn(testUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);

        when(jwtService.generateToken(anyMap(), any(UserDetails.class))).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        authenticationService.authenticate(loginRequest);

        // Then
        verify(jwtService).generateToken(argThat(claims -> claims.containsKey("fullName") &&
                claims.containsKey("role") &&
                claims.containsKey("userId")), eq(testUser));
    }
}
