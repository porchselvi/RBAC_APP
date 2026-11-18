package com.example.rbac.controller;

import com.example.rbac.domain.User;
import com.example.rbac.dto.AuthResponse;
import com.example.rbac.dto.LoginRequest;
import com.example.rbac.dto.RegisterRequest;
import com.example.rbac.dto.UserResponse;
import com.example.rbac.repository.UserRepository;
import com.example.rbac.security.JwtService;
import com.example.rbac.service.RbacService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final RbacService rbacService;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository users,
                          RbacService rbacService, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.rbacService = rbacService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.email().trim().toLowerCase(), request.password()));
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return tokenFor(user);
    }

    @PostMapping("/register")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        User user = rbacService.register(request.name(), request.email(), request.password());
        return tokenFor(user);
    }

    private AuthResponse tokenFor(User user) {
        return new AuthResponse(jwtService.createToken(user), "Bearer", jwtService.getExpirationMs(),
                UserResponse.from(user));
    }
}
