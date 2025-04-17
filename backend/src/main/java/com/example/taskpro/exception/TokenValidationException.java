package com.example.taskpro.exception;


public class TokenValidationException extends RuntimeException {
    public TokenValidationException(String message) {
        super(message);
    }
}

