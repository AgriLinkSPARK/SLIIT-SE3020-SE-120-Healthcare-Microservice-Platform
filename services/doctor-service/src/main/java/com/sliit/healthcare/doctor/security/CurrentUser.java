package com.sliit.healthcare.doctor.security;

public record CurrentUser(String userId, String email, String role) {
}
