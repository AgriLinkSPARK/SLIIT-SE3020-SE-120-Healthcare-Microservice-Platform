package com.sliit.healthcare.auth.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.healthcare.auth.dto.UserResponse;
import com.sliit.healthcare.auth.model.User;
import com.sliit.healthcare.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        return authService.me(user);
    }

    @GetMapping("/users/{userId}")
    public UserResponse user(@PathVariable String userId) {
        return authService.getUserById(userId);
    }

    @GetMapping("/users")
    public List<UserResponse> users(@RequestParam(required = false) String userIds) {
        List<String> ids = userIds == null || userIds.isBlank()
                ? List.of()
                : List.of(userIds.split(","));
        return authService.getUsersByIds(ids.stream().map(String::trim).filter(value -> !value.isBlank()).toList());
    }
}
