package com.sliit.healthcare.payment.controller;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.sliit.healthcare.payment.dto.PaymentResponseDTO;
import com.sliit.healthcare.payment.service.PaymentService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/webhooks/payhere")
@Slf4j
public class PayHereWebhookController {

    private final PaymentService paymentService;

    @Value("${payment.success-redirect-url:http://localhost:3000/payment/success}")
    private String frontendSuccessUrl;

    @Value("${payment.failure-redirect-url:http://localhost:3000/payment/failure}")
    private String frontendFailureUrl;

    public PayHereWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/notify")
    public ResponseEntity<String> handleNotify(@RequestParam Map<String, String> callbackParams) {
        PaymentResponseDTO response = paymentService.processPayHereCallback(callbackParams, false);

        if (Boolean.TRUE.equals(response.getSuccess())) {
            log.info("Processed PayHere notify callback for transaction: {}", response.getTransactionId());
            return ResponseEntity.ok("OK");
        }

        log.warn("Failed PayHere notify callback: {}", response.getMessage());
        return ResponseEntity.badRequest().body(response.getMessage());
    }

    @GetMapping("/notify")
    public ResponseEntity<String> handleNotifyGet(@RequestParam Map<String, String> callbackParams) {
        return handleNotify(callbackParams);
    }

    @GetMapping("/return")
    public ResponseEntity<Void> handleReturn(@RequestParam Map<String, String> callbackParams) {
        PaymentResponseDTO response = paymentService.processPayHereCallback(callbackParams, false);
        URI location = buildFrontendRedirect(response);
        return ResponseEntity.status(302).location(location).build();
    }

    @GetMapping("/cancel")
    public ResponseEntity<Void> handleCancel(@RequestParam Map<String, String> callbackParams) {
        PaymentResponseDTO response = paymentService.processPayHereCallback(callbackParams, true);
        URI location = buildFrontendRedirect(response);
        return ResponseEntity.status(302).location(location).build();
    }

    private URI buildFrontendRedirect(PaymentResponseDTO response) {
        String base = Boolean.TRUE.equals(response.getSuccess())
                && "SUCCEEDED".equalsIgnoreCase(response.getStatus())
                ? frontendSuccessUrl
                : frontendFailureUrl;

        Map<String, String> params = new LinkedHashMap<>();
        params.put("paymentId", response.getId());
        params.put("transactionId", response.getTransactionId());
        params.put("status", response.getStatus());
        params.put("message", response.getMessage());

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(base);
        params.forEach((key, value) -> {
            if (value != null && !value.isBlank()) {
                builder.queryParam(key, value);
            }
        });

        return builder.build(true).toUri();
    }
}
