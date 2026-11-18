package com.example.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateRoleRequest(
        @NotBlank @Size(max = 80) String name,
        @NotEmpty Set<@NotBlank @Size(max = 100) String> permissions) { }
