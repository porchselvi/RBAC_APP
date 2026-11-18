package com.example.rbac.config;

import com.example.rbac.domain.Role;
import com.example.rbac.domain.User;
import com.example.rbac.repository.RoleRepository;
import com.example.rbac.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initializeData(RoleRepository roles, UserRepository users,
                                     PasswordEncoder encoder,
                                     @Value("${app.bootstrap-admin.name}") String adminName,
                                     @Value("${app.bootstrap-admin.email}") String adminEmail,
                                     @Value("${app.bootstrap-admin.password}") String adminPassword) {
        return args -> {
            Role admin = ensureRole(roles, "ADMIN", Set.of("Users", "Roles", "Reports", "Audit Logs"));
            ensureRole(roles, "MANAGER", Set.of("Reports", "Approvals", "Team Access"));
            ensureRole(roles, "DEVELOPER", Set.of("Projects", "Code Review", "Tickets"));
            ensureRole(roles, "USER", Set.of("Profile"));

            if (users.findByEmailIgnoreCase(adminEmail).isEmpty()) {
                users.save(new User(adminName, adminEmail, encoder.encode(adminPassword), admin));
            }
        };
    }

    private Role ensureRole(RoleRepository repository, String name, Set<String> permissions) {
        return repository.findByNameIgnoreCase(name).orElseGet(() -> repository.save(new Role(name, permissions)));
    }
}
