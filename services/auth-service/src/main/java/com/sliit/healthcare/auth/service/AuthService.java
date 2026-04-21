package com.sliit.healthcare.auth.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sliit.healthcare.auth.dto.AuthResponse;
import com.sliit.healthcare.auth.dto.LoginRequest;
import com.sliit.healthcare.auth.dto.RegisterRequest;
import com.sliit.healthcare.auth.dto.UserResponse;
import com.sliit.healthcare.auth.model.Role;
import com.sliit.healthcare.auth.model.User;
import com.sliit.healthcare.auth.repository.UserRepository;
import com.sliit.healthcare.auth.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        if (request.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin cannot be self-registered");
        }

        String specialization = request.getSpecialization() == null ? null : request.getSpecialization().trim();
        if (request.getRole() == Role.DOCTOR && (specialization == null || specialization.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor category is required for doctor registration");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .specialization(specialization)
                .role(request.getRole())
                .doctorVerified(request.getRole() != Role.DOCTOR)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        User saved = userRepository.save(user);
        return toAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        return toAuthResponse(user);
    }

    public UserResponse me(User user) {
        return toUserResponse(user);
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserResponse(user);
    }

    public List<UserResponse> getUsersByIds(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }

        return userRepository.findByUserIdIn(userIds).stream()
                .map(AuthService::toUserResponse)
                .toList();
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
            .specialization(user.getSpecialization())
                .role(user.getRole())
                .doctorVerified(user.isDoctorVerified())
                .build();
    }

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
            .specialization(user.getSpecialization())
                .role(user.getRole())
                .doctorVerified(user.isDoctorVerified())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
