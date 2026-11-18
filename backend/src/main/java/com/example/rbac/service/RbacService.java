package com.example.rbac.service;

import com.example.rbac.domain.Role;
import com.example.rbac.domain.User;
import com.example.rbac.dto.CreateRoleRequest;
import com.example.rbac.dto.CreateUserRequest;
import com.example.rbac.repository.RoleRepository;
import com.example.rbac.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RbacService {
    private final RoleRepository roles;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public RbacService(RoleRepository roles, UserRepository users, PasswordEncoder passwordEncoder) {
        this.roles = roles;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Role> getRoles() { return roles.findAll(); }

    @Transactional(readOnly = true)
    public List<User> getUsers() { return users.findAll(); }

    @Transactional
    public Role createRole(CreateRoleRequest request) {
        String name = request.name().trim().toUpperCase();
        if (roles.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Role already exists");
        }
        return roles.save(new Role(name, request.permissions()));
    }

    @Transactional
    public User createUser(CreateUserRequest request) {
        return createUser(request.name(), request.email(), request.password(), request.role());
    }

    @Transactional
    public User register(String name, String email, String password) {
        Role defaultRole = roles.findByNameIgnoreCase("USER")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Default role missing"));
        return saveUser(name, email, password, defaultRole);
    }

    private User createUser(String name, String email, String password, String roleName) {
        Role role = roles.findByNameIgnoreCase(roleName.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role"));
        return saveUser(name, email, password, role);
    }

    private User saveUser(String name, String email, String password, Role role) {
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        return users.save(new User(name, email, passwordEncoder.encode(password), role));
    }
}
