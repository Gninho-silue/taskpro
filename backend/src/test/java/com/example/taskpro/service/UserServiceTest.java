package com.example.taskpro.service;

import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.dto.user.UserCreateDTO;
import com.example.taskpro.exception.OperationNotPermittedException;
import com.example.taskpro.exception.ResourceNotFoundException;
import com.example.taskpro.mapper.UserMapper;
import com.example.taskpro.model.Role;
import com.example.taskpro.model.User;
import com.example.taskpro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour UserService
 * Couvre tous les scénarios de gestion des utilisateurs
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private User adminUser;
    private UserBasicDTO userBasicDTO;
    private UserCreateDTO userCreateDTO;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(1L)
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .preferredLanguage("en")
                .role(Role.USER)
                .enabled(true)
                .accountLocked(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Setup admin user
        adminUser = User.builder()
                .id(2L)
                .firstname("Admin")
                .lastname("User")
                .email("admin@example.com")
                .role(Role.ADMIN)
                .enabled(true)
                .accountLocked(false)
                .build();

        // Setup DTOs
        userBasicDTO = UserBasicDTO.builder()
                .id(1L)
                .firstname("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .build();

        userCreateDTO = UserCreateDTO.builder()
                .firstname("John")
                .lastname("Doe")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .preferredLanguage("en")
                .profileImage("profile.jpg")
                .build();

        // Setup authentication
        authentication = mock(Authentication.class);
    }

    @Test
    @DisplayName("Should get user by ID successfully")
    void shouldGetUserByIdSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userMapper.toBasicDto(testUser)).thenReturn(userBasicDTO);

        // When
        UserBasicDTO result = userService.getUserById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John", result.getFirstname());
        assertEquals("Doe", result.getLastname());
        assertEquals("john.doe@example.com", result.getEmail());

        verify(userRepository).findById(1L);
        verify(userMapper).toBasicDto(testUser);
    }

    @Test
    @DisplayName("Should throw exception when user not found by ID")
    void shouldThrowExceptionWhenUserNotFoundById() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getUserById(999L)
        );

        assertEquals("User not found with ID: 999", exception.getMessage());
        verify(userRepository).findById(999L);
        verify(userMapper, never()).toBasicDto(any());
    }

    @Test
    @DisplayName("Should get current user successfully")
    void shouldGetCurrentUserSuccessfully() {
        // Given
        when(authentication.getName()).thenReturn("admin@example.com");
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(userMapper.toBasicDto(adminUser)).thenReturn(UserBasicDTO.builder()
                .id(2L)
                .firstname("Admin")
                .lastname("User")
                .email("admin@example.com")
                .build());

        // When
        UserBasicDTO result = userService.getCurrentUser(authentication);

        // Then
        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("Admin", result.getFirstname());
        assertEquals("User", result.getLastname());

        verify(userRepository).findByEmail("admin@example.com");
        verify(userMapper).toBasicDto(adminUser);
    }

    @Test
    @DisplayName("Should get user by email successfully")
    void shouldGetUserByEmailSuccessfully() {
        // Given
        when(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(testUser));
        when(userMapper.toBasicDto(testUser)).thenReturn(userBasicDTO);

        // When
        UserBasicDTO result = userService.getUserByEmail("john.doe@example.com");

        // Then
        assertNotNull(result);
        assertEquals("john.doe@example.com", result.getEmail());

        verify(userRepository).findByEmail("john.doe@example.com");
        verify(userMapper).toBasicDto(testUser);
    }

    @Test
    @DisplayName("Should throw exception when user not found by email")
    void shouldThrowExceptionWhenUserNotFoundByEmail() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getUserByEmail("nonexistent@example.com")
        );

        assertEquals("User not found with email: nonexistent@example.com", exception.getMessage());
    }

    @Test
    @DisplayName("Should update user successfully")
    void shouldUpdateUserSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toBasicDto(testUser)).thenReturn(userBasicDTO);

        // When
        UserBasicDTO result = userService.updateUser(1L, userCreateDTO);

        // Then
        assertNotNull(result);
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
        verify(userMapper).toBasicDto(testUser);

        // Verify that user fields were updated
        assertEquals("John", testUser.getFirstname());
        assertEquals("Doe", testUser.getLastname());
        assertEquals(LocalDate.of(1990, 1, 1), testUser.getDateOfBirth());
        assertEquals("en", testUser.getPreferredLanguage());
        assertEquals("profile.jpg", testUser.getProfileImage());
    }

    @Test
    @DisplayName("Should update only provided fields")
    void shouldUpdateOnlyProvidedFields() {
        // Given
        UserCreateDTO partialUpdate = UserCreateDTO.builder()
                .firstname("Jane") // Only update firstname
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toBasicDto(testUser)).thenReturn(userBasicDTO);

        // When
        userService.updateUser(1L, partialUpdate);

        // Then
        assertEquals("Jane", testUser.getFirstname()); // Should be updated
        assertEquals("Doe", testUser.getLastname()); // Should remain unchanged
        assertEquals("en", testUser.getPreferredLanguage()); // Should remain unchanged
    }

    @Test
    @DisplayName("Should disable user account successfully by admin")
    void shouldDisableUserAccountSuccessfullyByAdmin() {
        // Given
        when(authentication.getName()).thenReturn("admin@example.com");
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.setAccountDisable(1L, true, authentication);

        // Then
        assertFalse(testUser.isEnabled());
        verify(userRepository).findByEmail("admin@example.com");
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when non-admin tries to disable account")
    void shouldThrowExceptionWhenNonAdminTriesToDisableAccount() {
        // Given
        when(authentication.getName()).thenReturn("admin@example.com");
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(testUser)); // Non-admin user
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        OperationNotPermittedException exception = assertThrows(
                OperationNotPermittedException.class,
                () -> userService.setAccountDisable(1L, true, authentication)
        );

        assertEquals("Only admins can disable users.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should lock user account successfully")
    void shouldLockUserAccountSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.setAccountLock(1L, true);

        // Then
        assertTrue(testUser.isAccountLocked());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should unlock user account successfully")
    void shouldUnlockUserAccountSuccessfully() {
        // Given
        testUser.setAccountLocked(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.setAccountLock(1L, false);

        // Then
        assertFalse(testUser.isAccountLocked());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should search users successfully")
    void shouldSearchUsersSuccessfully() {
        // Given
        List<User> searchResults = List.of(testUser);
        when(userRepository.findByEmailContainingOrFirstnameContainingOrLastnameContaining(
                "john", "john", "john")).thenReturn(searchResults);
        when(userMapper.toBasicDto(testUser)).thenReturn(userBasicDTO);

        // When
        List<UserBasicDTO> result = userService.searchUsers("john");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("john.doe@example.com", result.get(0).getEmail());

        verify(userRepository).findByEmailContainingOrFirstnameContainingOrLastnameContaining(
                "john", "john", "john");
        verify(userMapper).toBasicDto(testUser);
    }

    @Test
    @DisplayName("Should change user role successfully by admin")
    void shouldChangeUserRoleSuccessfullyByAdmin() {
        // Given
        when(authentication.getName()).thenReturn("admin@example.com");
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.changeUserRole(1L, Role.ADMIN, authentication);

        // Then
        assertEquals(Role.ADMIN, testUser.getRole());
        verify(userRepository).findByEmail("admin@example.com");
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when non-admin tries to change role")
    void shouldThrowExceptionWhenNonAdminTriesToChangeRole() {
        // Given
        when(authentication.getName()).thenReturn("admin@example.com");
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(testUser)); // Non-admin user
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        OperationNotPermittedException exception = assertThrows(
                OperationNotPermittedException.class,
                () -> userService.changeUserRole(1L, Role.ADMIN, authentication)
        );

        assertEquals("Only admins can change user roles", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should update language preference successfully")
    void shouldUpdateLanguagePreferenceSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.updateLanguagePreference(1L, "fr");

        // Then
        assertEquals("fr", testUser.getPreferredLanguage());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should handle null values in update gracefully")
    void shouldHandleNullValuesInUpdateGracefully() {
        // Given
        UserCreateDTO nullUpdate = UserCreateDTO.builder()
                .firstname(null)
                .lastname(null)
                .dateOfBirth(null)
                .preferredLanguage(null)
                .profileImage(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toBasicDto(testUser)).thenReturn(userBasicDTO);

        // When
        userService.updateUser(1L, nullUpdate);

        // Then
        assertEquals("John", testUser.getFirstname()); // Should remain unchanged
        assertEquals("Doe", testUser.getLastname()); // Should remain unchanged
        assertEquals("en", testUser.getPreferredLanguage()); // Should remain unchanged
    }
}
