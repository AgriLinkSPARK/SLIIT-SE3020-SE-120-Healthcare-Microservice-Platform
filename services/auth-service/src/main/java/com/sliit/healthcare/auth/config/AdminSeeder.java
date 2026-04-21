package com.sliit.healthcare.auth.config;

import java.time.Instant;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.sliit.healthcare.auth.model.Role;
import com.sliit.healthcare.auth.model.User;
import com.sliit.healthcare.auth.repository.UserRepository;

@Component
@ConditionalOnProperty(name = "auth.seed-admin.enabled", havingValue = "true", matchIfMissing = true)
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSeedProperties adminSeedProperties;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, AdminSeedProperties adminSeedProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminSeedProperties = adminSeedProperties;
    }

    @Override
    public void run(String... args) {
        String email = adminSeedProperties.email().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = User.builder()
                .fullName(adminSeedProperties.fullName())
                .email(email)
                .password(passwordEncoder.encode(adminSeedProperties.password()))
                .role(Role.ADMIN)
                .doctorVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        userRepository.save(admin);
    }
}
