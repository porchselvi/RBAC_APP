package com.example.rbac.controller;

import com.example.rbac.dto.CreateRoleRequest;
import com.example.rbac.dto.RoleResponse;
import com.example.rbac.service.RbacService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {
    private final RbacService rbacService;

    public RoleController(RbacService rbacService) { this.rbacService = rbacService; }

    @GetMapping
    public List<RoleResponse> list() {
        return rbacService.getRoles().stream().map(RoleResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse create(@Valid @RequestBody CreateRoleRequest request) {
        return RoleResponse.from(rbacService.createRole(request));
    }
}
