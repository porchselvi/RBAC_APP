package com.example.rbac.controller;

import com.example.rbac.dto.RbacResponse;
import com.example.rbac.dto.RoleResponse;
import com.example.rbac.dto.UserResponse;
import com.example.rbac.service.RbacService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rbac")
@PreAuthorize("hasRole('ADMIN')")
public class RbacController {
    private final RbacService rbacService;

    public RbacController(RbacService rbacService) { this.rbacService = rbacService; }

    @GetMapping
    public RbacResponse dashboard() {
        return new RbacResponse(
                rbacService.getUsers().stream().map(UserResponse::from).toList(),
                rbacService.getRoles().stream().map(RoleResponse::from).toList());
    }
}
