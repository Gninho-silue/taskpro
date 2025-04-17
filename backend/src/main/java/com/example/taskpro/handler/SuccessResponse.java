package com.example.taskpro.handler;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class SuccessResponse {
    private String message;
    private int code;
    private LocalDateTime timestamp;
    private Object data;
}

