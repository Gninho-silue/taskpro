package com.example.taskpro.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests complets pour PasswordValidator
 * Couvre tous les critères de validation de sécurité
 */
class PasswordValidatorTest {

    private PasswordValidator passwordValidator;

    @BeforeEach
    void setUp() {
        passwordValidator = new PasswordValidator();
    }

    @Test
    @DisplayName("Should accept valid strong password")
    void shouldAcceptValidStrongPassword() {
        // Given
        String validPassword = "MySecure258!";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(validPassword);

        // Then
        assertTrue(result.valid());
        assertFalse(result.hasErrors());
        assertEquals(0, result.getErrorCount());
    }

    @Test
    @DisplayName("Should reject null password")
    void shouldRejectNullPassword() {
        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(null);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("Password is required"));
    }

    @Test
    @DisplayName("Should reject empty password")
    void shouldRejectEmptyPassword() {
        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate("");

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("Password is required"));
    }

    @Test
    @DisplayName("Should reject password too short")
    void shouldRejectPasswordTooShort() {
        // Given
        String shortPassword = "Ab1!";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(shortPassword);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("at least 8 characters long"));
    }

    @Test
    @DisplayName("Should reject password without lowercase")
    void shouldRejectPasswordWithoutLowercase() {
        // Given
        String passwordWithoutLowercase = "STRONGPASS123!";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(passwordWithoutLowercase);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("lowercase letter"));
    }

    @Test
    @DisplayName("Should reject password without uppercase")
    void shouldRejectPasswordWithoutUppercase() {
        // Given
        String passwordWithoutUppercase = "strongpass123!";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(passwordWithoutUppercase);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("uppercase letter"));
    }

    @Test
    @DisplayName("Should reject password without digit")
    void shouldRejectPasswordWithoutDigit() {
        // Given
        String passwordWithoutDigit = "StrongPass!";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(passwordWithoutDigit);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("digit"));
    }

    @Test
    @DisplayName("Should reject password without special character")
    void shouldRejectPasswordWithoutSpecialCharacter() {
        // Given
        String passwordWithoutSpecial = "StrongPass123";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(passwordWithoutSpecial);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("special character"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"aaaStrong123!", "111Strong123!", "AAAStrong123!", "!!!Strong123!"})
    @DisplayName("Should reject passwords with repeated characters")
    void shouldRejectPasswordsWithRepeatedCharacters(String password) {
        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(password);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("repeated characters"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"abc123Strong!", "123abcStrong!", "ABC123Strong!", "xyz789Strong!"})
    @DisplayName("Should reject passwords with sequential characters")
    void shouldRejectPasswordsWithSequentialCharacters(String password) {
        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(password);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("sequential"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"password123!", "admin123!", "qwerty123!", "welcome123!"})
    @DisplayName("Should reject passwords containing common words")
    void shouldRejectPasswordsContainingCommonWords(String password) {
        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(password);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("common"));
    }

    @Test
    @DisplayName("Should reject password too long")
    void shouldRejectPasswordTooLong() {
        // Given
        String longPassword = "a".repeat(130) + "A1!";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(longPassword);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorMessage().contains("exceed 128 characters"));
    }

    @Test
    @DisplayName("Should calculate password strength correctly")
    void shouldCalculatePasswordStrengthCorrectly() {
        // Test weak password
        assertTrue(passwordValidator.calculatePasswordStrength("weak") < 20);
        
        // Test medium password
        assertTrue(passwordValidator.calculatePasswordStrength("Medium258") > 50);
        
        // Test strong password
        assertTrue(passwordValidator.calculatePasswordStrength("VerySecure258!") > 80);
        
        // Test very strong password
        assertTrue(passwordValidator.calculatePasswordStrength("VerySecurePassword258!@#") > 90);
    }

    @Test
    @DisplayName("Should return password requirements")
    void shouldReturnPasswordRequirements() {
        // When
        String requirements = passwordValidator.getPasswordRequirements();

        // Then
        assertNotNull(requirements);
        assertFalse(requirements.isEmpty());
        assertTrue(requirements.contains("8-128 characters"));
        assertTrue(requirements.contains("lowercase"));
        assertTrue(requirements.contains("uppercase"));
        assertTrue(requirements.contains("digit"));
        assertTrue(requirements.contains("special character"));
    }

    @Test
    @DisplayName("Should handle multiple validation errors")
    void shouldHandleMultipleValidationErrors() {
        // Given
        String weakPassword = "weak";

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(weakPassword);

        // Then
        assertFalse(result.valid());
        assertTrue(result.hasErrors());
        assertTrue(result.getErrorCount() > 1);
        assertTrue(result.getErrorMessage().contains(",")); // Multiple errors separated by comma
    }

    @Test
    @DisplayName("Should accept valid password at minimum length")
    void shouldAcceptValidPasswordAtMinimumLength() {
        // Given
        String minLengthPassword = "Ab2!defg"; // Exactly 8 characters

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(minLengthPassword);

        // Then
        assertTrue(result.valid());
        assertFalse(result.hasErrors());
    }

    @Test
    @DisplayName("Should accept valid password at maximum length")
    void shouldAcceptValidPasswordAtMaximumLength() {
        // Given
        String maxLengthPassword = "A".repeat(125) + "b2!"; // Exactly 128 characters

        // When
        PasswordValidator.PasswordValidationResult result = passwordValidator.validate(maxLengthPassword);

        // Then
        assertTrue(result.valid());
        assertFalse(result.hasErrors());
    }
}