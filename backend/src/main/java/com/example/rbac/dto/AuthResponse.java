package com.example.rbac.dto;

import java.util.List;

public record AuthResponse(String token, String tokenType, long expiresIn, UserResponse user) { }
