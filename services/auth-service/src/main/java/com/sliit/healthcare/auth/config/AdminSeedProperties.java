package com.sliit.healthcare.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@ConfigurationProperties(prefix = "auth.seed-admin")
public record AdminSeedProperties(
        boolean enabled,
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank String password) {
}
