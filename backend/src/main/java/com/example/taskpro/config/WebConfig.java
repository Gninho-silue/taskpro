package com.example.taskpro.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final UserLocaleInterceptor userLocaleInterceptor;

    public WebConfig(UserLocaleInterceptor userLocaleInterceptor) {
        this.userLocaleInterceptor = userLocaleInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(userLocaleInterceptor);
    }
}