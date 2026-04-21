package com.sliit.healthcare.auth.dto;

import com.sliit.healthcare.auth.model.Role;

import lombok.Builder;

@Builder
public record AuthResponse(
        String token,
        String userId,
        String fullName,
        String email,
        String specialization,
        Role role,
        boolean doctorVerified) {
}
