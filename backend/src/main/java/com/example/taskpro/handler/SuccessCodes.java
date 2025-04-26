package com.example.taskpro.handler;

import lombok.Getter;

@Getter
public enum SuccessCodes {

    USER_REGISTERED(201, "User registered successfully"),
    USER_LOGGED_IN(200, "Login successful"),
    EMAIL_VERIFIED(200, "Email verified successfully"),
    PASSWORD_RESET_LINK_SENT(305, "Password reset link sent"),
    PASSWORD_RESET_SUCCESS(306, "Password reset successfully"),
    SUCCESS_CODE(200, "Entity created successfully"),
    ;

    private final int code;
    private final String message;

    SuccessCodes(int code, String message) {
        this.code = code;
        this.message = message;
    }

}
