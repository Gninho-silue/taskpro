package com.example.taskpro.config;


import com.example.taskpro.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Locale;

@Component
public class UserLocaleInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    public UserLocaleInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication.getPrincipal() instanceof String)) {
            userRepository.findByEmail(authentication.getName())
                    .ifPresent(user -> {
                        if (user.getPreferredLanguage() != null) {
                            LocaleContextHolder.setLocale(new Locale(user.getPreferredLanguage()));
                        }
                    });
        }
        return true;
    }
}