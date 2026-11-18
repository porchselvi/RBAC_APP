package com.example.rbac.dto;

import java.util.List;

public record RbacResponse(List<UserResponse> users, List<RoleResponse> roles) { }
