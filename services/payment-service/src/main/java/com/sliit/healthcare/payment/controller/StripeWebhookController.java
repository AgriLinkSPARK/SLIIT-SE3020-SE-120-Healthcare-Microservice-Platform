package com.sliit.healthcare.payment.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.healthcare.payment.service.StripeWebhookService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/webhooks")
@Slf4j
public class StripeWebhookController {

    private final StripeWebhookService webhookService;

    public StripeWebhookController(StripeWebhookService webhookService) {
        this.webhookService = webhookService;
    }

    /**
     * Handles Stripe webhook events
     * POST /webhooks/stripe
     */
    @PostMapping("/stripe")
    public ResponseEntity<Map<String, String>> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        log.info("Received Stripe webhook event");
        
        try {
            webhookService.processStripeEvent(payload, sigHeader);
            
            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("message", "Event processed successfully");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid webhook signature: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("message", "Invalid signature");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            
        } catch (Exception e) {
            log.error("Error processing webhook event: {}", e.getMessage(), e);
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("message", "Error processing event");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Health check for webhook
     * GET /webhooks/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "webhook-service");
        return ResponseEntity.ok(response);
    }
}
