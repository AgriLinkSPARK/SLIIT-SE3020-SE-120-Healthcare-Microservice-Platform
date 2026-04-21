package com.sliit.healthcare.auth.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sliit.healthcare.auth.dto.UserResponse;
import com.sliit.healthcare.auth.model.Role;
import com.sliit.healthcare.auth.model.User;
import com.sliit.healthcare.auth.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(AuthService::toUserResponse).toList();
    }

    public UserResponse verifyDoctor(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only doctor accounts can be verified");
        }

        user.setDoctorVerified(true);
        user.setUpdatedAt(Instant.now());
        return AuthService.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateRole(String userId, Role role) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Role previousRole = user.getRole();
        user.setRole(role);

        if (role == Role.DOCTOR && previousRole != Role.DOCTOR) {
            user.setDoctorVerified(false);
        }

        if (role != Role.DOCTOR) {
            user.setDoctorVerified(true);
        }
        user.setUpdatedAt(Instant.now());

        return AuthService.toUserResponse(userRepository.save(user));
    }
}
