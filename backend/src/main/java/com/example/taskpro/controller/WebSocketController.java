package com.example.taskpro.controller;

import com.example.taskpro.dto.notification.NotificationWSDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    @MessageMapping("/notification")
    @SendTo("/topic/notifications")
    public NotificationWSDTO broadcastNotification(NotificationWSDTO notification) {
        return notification;
    }
}