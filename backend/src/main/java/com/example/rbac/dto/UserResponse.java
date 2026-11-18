package com.example.rbac.dto;

import com.example.rbac.domain.User;

public record UserResponse(Long id, String name, String email, String role) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().getName());
    }
}
