package com.sliit.healthcare.payment.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        Map<String, String> response = new HashMap<>();
        response.put("service", "payment-service");
        response.put("status", "UP");
        response.put("health", "/api/v1/payments/health");
        return ResponseEntity.ok(response);
    }
}
