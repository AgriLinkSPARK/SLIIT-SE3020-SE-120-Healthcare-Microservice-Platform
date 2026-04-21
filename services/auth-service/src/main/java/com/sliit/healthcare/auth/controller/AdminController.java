package com.sliit.healthcare.auth.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.healthcare.auth.dto.RoleUpdateRequest;
import com.sliit.healthcare.auth.dto.UserResponse;
import com.sliit.healthcare.auth.service.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return adminService.getAllUsers();
    }

    @PostMapping("/doctors/{userId}/verify")
    public UserResponse verifyDoctor(@PathVariable String userId) {
        return adminService.verifyDoctor(userId);
    }

    @PutMapping("/users/{userId}/role")
    public UserResponse updateRole(@PathVariable String userId, @Valid @RequestBody RoleUpdateRequest request) {
        return adminService.updateRole(userId, request.getRole());
    }
}
