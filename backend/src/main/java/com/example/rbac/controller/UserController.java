package com.example.rbac.controller;

import com.example.rbac.dto.CreateUserRequest;
import com.example.rbac.dto.UserResponse;
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
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final RbacService rbacService;

    public UserController(RbacService rbacService) { this.rbacService = rbacService; }

    @GetMapping
    public List<UserResponse> list() {
        return rbacService.getUsers().stream().map(UserResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return UserResponse.from(rbacService.createUser(request));
    }
}
