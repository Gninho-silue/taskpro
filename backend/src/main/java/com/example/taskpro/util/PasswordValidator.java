package com.example.taskpro.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Validateur de mots de passe robuste pour assurer la sécurité des comptes utilisateurs.
 * Implémente les meilleures pratiques de sécurité pour la validation des mots de passe.
 *
 * @author TaskPro Team
 * @version 1.0
 */
@Slf4j
@Component
public class PasswordValidator {

    // Patterns pour différents critères de sécurité
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");
    private static final Pattern COMMON_PATTERNS = Pattern.compile("(.)\\1{2,}"); // Répétition de caractères
    private static final Pattern SEQUENTIAL_PATTERN = Pattern.compile("(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)", Pattern.CASE_INSENSITIVE);

    // Mots de passe communs à éviter (liste non exhaustive)
    private static final String[] COMMON_PASSWORDS = {
            "password", "123456", "password123", "admin", "qwerty",
            "letmein", "welcome", "monkey", "1234567890", "abc123",
            "password1", "12345678", "welcome123", "admin123", "root",
            "toor", "pass", "test", "user", "guest", "demo", "sample"
    };

    // Longueur minimale et maximale
    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;

    /**
     * Valide la force d'un mot de passe selon les critères de sécurité définis.
     *
     * @param password Le mot de passe à valider
     * @return PasswordValidationResult contenant le résultat de la validation et les erreurs éventuelles
     */
    public PasswordValidationResult validate(String password) {
        log.debug("Starting password validation");

        List<String> errors = new ArrayList<>();

        // Vérification de base
        if (password == null || password.trim().isEmpty()) {
            errors.add("Password is required");
            return new PasswordValidationResult(false, errors);
        }

        // Vérifications de longueur
        if (password.length() < MIN_LENGTH) {
            errors.add(String.format("Password must be at least %d characters long", MIN_LENGTH));
        }

        if (password.length() > MAX_LENGTH) {
            errors.add(String.format("Password must not exceed %d characters", MAX_LENGTH));
        }

        // Vérifications de complexité
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one lowercase letter");
        }

        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one uppercase letter");
        }

        if (!DIGIT_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one digit");
        }

        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;':\",./<>?)");
        }

        // Vérifications de sécurité avancées
        if (COMMON_PATTERNS.matcher(password).find()) {
            errors.add("Password must not contain repeated characters (e.g., aaa, 111)");
        }

        if (SEQUENTIAL_PATTERN.matcher(password).find()) {
            errors.add("Password must not contain sequential characters (e.g., abc, 123)");
        }

        // Vérifier contre les mots de passe communs
        String lowerPassword = password.toLowerCase();
        for (String commonPassword : COMMON_PASSWORDS) {
            if (lowerPassword.contains(commonPassword)) {
                errors.add("Password must not contain common words or patterns");
                break;
            }
        }

        // Vérifier les espaces (non recommandés)
        if (password.contains(" ")) {
            errors.add("Password should not contain spaces");
        }

        boolean isValid = errors.isEmpty();

        if (isValid) {
            log.debug("Password validation successful");
        } else {
            log.warn("Password validation failed with {} errors: {}", errors.size(), errors);
        }

        return new PasswordValidationResult(isValid, errors);
    }

    /**
     * Retourne les exigences de mot de passe pour l'affichage utilisateur.
     *
     * @return String décrivant les exigences de mot de passe
     */
    public String getPasswordRequirements() {
        return String.format(
                "Password must be %d-%d characters long, contain at least one lowercase letter, " +
                        "one uppercase letter, one digit, one special character, and must not contain " +
                        "repeated characters, sequential patterns, or common words.",
                MIN_LENGTH, MAX_LENGTH
        );
    }

    /**
     * Calcule un score de force du mot de passe (0-100).
     *
     * @param password Le mot de passe à évaluer
     * @return Score de 0 à 100 (100 = très fort)
     */
    public int calculatePasswordStrength(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }

        int score = 0;

        // Longueur
        if (password.length() >= MIN_LENGTH) score += 20;
        if (password.length() >= 12) score += 10;
        if (password.length() >= 16) score += 10;

        // Complexité
        if (LOWERCASE_PATTERN.matcher(password).find()) score += 10;
        if (UPPERCASE_PATTERN.matcher(password).find()) score += 10;
        if (DIGIT_PATTERN.matcher(password).find()) score += 10;
        if (SPECIAL_CHAR_PATTERN.matcher(password).find()) score += 10;

        // Diversité des caractères
        long uniqueChars = password.chars().distinct().count();
        if (uniqueChars >= 8) score += 10;
        if (uniqueChars >= 12) score += 10;

        return Math.min(score, 100);
    }

    /**
     * Résultat de la validation d'un mot de passe.
     */
    public record PasswordValidationResult(boolean valid, List<String> errors) {
        public PasswordValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors != null ? errors : new ArrayList<>();
        }

        public String getErrorMessage() {
            return String.join(", ", errors);
        }

        public boolean hasErrors() {
            return !errors.isEmpty();
        }

        public int getErrorCount() {
            return errors.size();
        }
    }
}