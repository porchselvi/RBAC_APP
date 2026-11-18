package com.example.rbac.dto;

import com.example.rbac.domain.Role;

import java.util.Set;

public record RoleResponse(Long id, String name, Set<String> permissions) {
    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getId(), role.getName(), role.getPermissions());
    }
}
