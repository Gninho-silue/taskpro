package com.example.taskpro.handler;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;
@Getter
public enum BusinessErrorCodes {

    NO_CODE(0, NOT_IMPLEMENTED, "No code"),
    INCORRECT_CURRENT_PASSWORD(300, BAD_REQUEST, "Current password is incorrect"),
    NEW_PASSWORD_DOES_NOT_MATCH(301, BAD_REQUEST, "The new password does not match"),
    ACCOUNT_LOCKED(302, FORBIDDEN, "User account is locked"),
    ACCOUNT_DISABLE(303, FORBIDDEN, "User account is disabled"),
    BAD_CREDENTIALS(304, FORBIDDEN, "Login and / or password is incorrect"),
    EMAIL_ALREADY_EXISTS(305, BAD_REQUEST, "Email already in use"),
    EMAIL_NOT_FOUND(306, NOT_FOUND, "Email not found"),
    ACCOUNT_NOT_VERIFIED(307, UNAUTHORIZED, "Account not verified"),
    INVALID_TOKEN(307, UNAUTHORIZED, "Invalid or expired token"),
    NO_FOUND(404, NOT_FOUND, "Resource not found"),


    ;

    private final int code;

    private final String message;

    private final HttpStatus httpStatus;

    BusinessErrorCodes(int code,HttpStatus httpStatus, String message) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

