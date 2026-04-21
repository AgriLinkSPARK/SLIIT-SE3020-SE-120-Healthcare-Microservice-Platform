package com.sliit.healthcare.auth.dto;

import java.time.Instant;

import com.sliit.healthcare.auth.model.Role;

import lombok.Builder;

@Builder
public record UserResponse(
        String userId,
        String fullName,
        String email,
        String specialization,
        Role role,
        boolean doctorVerified,
        boolean enabled,
        Instant createdAt) {
}
