package com.example.taskpro.mapper;

import com.example.taskpro.dto.user.UserBasicDTO;
import com.example.taskpro.dto.user.UserCreateDTO;
import com.example.taskpro.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserBasicDTO toBasicDto(User user) {
        if (user == null) return null;
        return UserBasicDTO.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .build();
    }

    public User toEntity(UserCreateDTO request) {
        if (request == null) return null;
        return User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
    }
}