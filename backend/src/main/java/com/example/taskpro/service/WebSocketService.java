package com.example.taskpro.service;

import com.example.taskpro.repository.UserRepository;
import com.example.taskpro.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final Map<Long, String> userSessions = new ConcurrentHashMap<>();
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        
        // Récupérer le token du header Authorization
        String token = headers.getFirstNativeHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                // Extraire le username du token
                String username = jwtService.extractUsername(token);
                
                // Trouver l'utilisateur correspondant
                userRepository.findByEmail(username).ifPresent(user -> {
                    userSessions.put(user.getId(), sessionId);
                    log.info("User {} connected via WebSocket with session {}", user.getId(), sessionId);
                });
            } catch (Exception e) {
                log.error("Error processing WebSocket connection", e);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        
        // Trouver et supprimer l'utilisateur déconnecté
        userSessions.entrySet().stream()
                .filter(entry -> sessionId.equals(entry.getValue()))
                .findFirst()
                .ifPresent(entry -> {
                    Long userId = entry.getKey();
                    userSessions.remove(userId);
                    log.info("User {} disconnected from WebSocket", userId);
                });
    }

    /**
     * Vérifie si un utilisateur est connecté via WebSocket
     */
    public boolean isUserConnected(Long userId) {
        return userSessions.containsKey(userId);
    }
}