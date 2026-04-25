package com.example.taskpro.handler;

import com.example.taskpro.exception.*;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static com.example.taskpro.handler.BusinessErrorCodes.*;
import static org.springframework.http.HttpStatus.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ExceptionResponse> handleException(LockedException exp) {
        log.warn("Account locked: {}", exp.getMessage());
        return ResponseEntity
                .status(UNAUTHORIZED)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorCode(ACCOUNT_LOCKED.getCode())
                                .businessErrorMessage(ACCOUNT_LOCKED.getMessage())
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ExceptionResponse> handleException(DisabledException exp) {
        log.warn("Account disabled: {}", exp.getMessage());
        return ResponseEntity
                .status(UNAUTHORIZED)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorCode(ACCOUNT_DISABLE.getCode())
                                .businessErrorMessage(ACCOUNT_DISABLE.getMessage())
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ExceptionResponse> handleException(BadCredentialsException exp) {
        log.warn("Bad credentials provided: {}", exp.getMessage());
        return ResponseEntity
                .status(UNAUTHORIZED)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorCode(BAD_CREDENTIALS.getCode())
                                .businessErrorMessage(BAD_CREDENTIALS.getMessage())
                                .error(BAD_CREDENTIALS.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ExceptionResponse> handleException(EmailAlreadyExistsException exp) {
        log.warn("Email already exists: {}", exp.getMessage());
        return ResponseEntity
                .status(BAD_REQUEST)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorCode(EMAIL_ALREADY_EXISTS.getCode())
                                .businessErrorMessage(EMAIL_ALREADY_EXISTS.getMessage())
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleException(EmailNotFoundException exp) {
        log.warn("Email not found: {}", exp.getMessage());
        return ResponseEntity
                .status(NOT_FOUND)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorCode(EMAIL_NOT_FOUND.getCode())
                                .businessErrorMessage(EMAIL_NOT_FOUND.getMessage())
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(AccountNotVerifiedException.class)
    public ResponseEntity<ExceptionResponse> handleException(AccountNotVerifiedException exp) {
        log.warn("Account not verified: {}", exp.getMessage());
        return ResponseEntity
                .status(UNAUTHORIZED)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorCode(ACCOUNT_NOT_VERIFIED.getCode())
                                .businessErrorMessage(ACCOUNT_NOT_VERIFIED.getMessage())
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }


    @ExceptionHandler(MessagingException.class)
    public ResponseEntity<ExceptionResponse> handleException(MessagingException exp) {
        log.warn("Messaging exception: {}", exp.getMessage());
        return ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponse.builder()
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionResponse> handleException(MethodArgumentNotValidException exp) {
        log.warn("MethodArgumentNotValidException: {}", exp.getMessage());

        Set<String> errors = new HashSet<>();
        exp.getBindingResult().getAllErrors().forEach((error) -> {
            var errorMessage = error.getDefaultMessage();
            errors.add(errorMessage);
        });
        return ResponseEntity
                .status(BAD_REQUEST)
                .body(
                        ExceptionResponse.builder()
                                .validationErrors(errors)
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ExceptionResponse> handleException(IllegalArgumentException exp) {
        log.warn("Illegal argument: {}", exp.getMessage());
        return ResponseEntity
                .status(BAD_REQUEST)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorMessage(exp.getMessage())
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleException(Exception exp) {
        log.error("Exception: {}", exp.getMessage());
        return ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorMessage("Internal error, please contact the admin")
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleException(ResourceNotFoundException exp) {
        log.warn("Ressource not found: {}", exp.getMessage());
        return ResponseEntity.status(NOT_FOUND).body(
                ExceptionResponse.builder()
                        .businessErrorCode(NO_FOUND.getCode())
                        .businessErrorMessage(NO_FOUND.getMessage())
                        .error(exp.getMessage())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @ExceptionHandler(TokenValidationException.class)
    public ResponseEntity<ExceptionResponse> handleException(TokenValidationException exp) {
        return ResponseEntity
                .status(UNAUTHORIZED)
                .body(
                        ExceptionResponse.builder()
                                .businessErrorCode(INVALID_TOKEN.getCode())
                                .businessErrorMessage(INVALID_TOKEN.getMessage())
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }


    @ExceptionHandler(OperationNotPermittedException.class)
    public ResponseEntity<ExceptionResponse> handleException(OperationNotPermittedException exp) {
        return ResponseEntity
                .status(BAD_REQUEST)
                .body(
                        ExceptionResponse.builder()
                                .error(exp.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
    }

}