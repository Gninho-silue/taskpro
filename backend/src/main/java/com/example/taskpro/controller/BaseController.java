package com.example.taskpro.controller;
import com.example.taskpro.handler.SuccessCodes;
import com.example.taskpro.handler.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

@RequiredArgsConstructor
public abstract class BaseController {
    protected ResponseEntity<SuccessResponse> createSuccessResponse(Object data, String message, HttpStatus status) {
        return ResponseEntity.status(status).body(
                SuccessResponse.builder()
                        .code(SuccessCodes.SUCCESS_CODE.getCode())
                        .message(message)
                        .data(data)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    protected ResponseEntity<SuccessResponse> okResponse(Object data, String message) {
        return createSuccessResponse(data, message, HttpStatus.OK);
    }

    protected ResponseEntity<SuccessResponse> createdResponse(Object data, String message) {
        return createSuccessResponse(data, message, HttpStatus.CREATED);
    }
}