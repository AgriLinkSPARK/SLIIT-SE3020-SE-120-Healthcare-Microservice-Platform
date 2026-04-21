package com.sliit.healthcare.payment.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.healthcare.payment.dto.PaymentRequestDTO;
import com.sliit.healthcare.payment.dto.PaymentResponseDTO;
import com.sliit.healthcare.payment.dto.RefundRequestDTO;
import com.sliit.healthcare.payment.entity.Payment;
import com.sliit.healthcare.payment.service.PaymentService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/payments")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Retrieves all payments
     * GET /payments?status=SUCCEEDED
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPayments(@RequestParam(required = false) String status) {
        log.info("Fetching all payments with status: {}", status);

        Map<String, Object> response = new HashMap<>();
        try {
            List<PaymentResponseDTO> payments;
            if (status != null && !status.isBlank()) {
                try {
                    Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.trim().toUpperCase());
                    payments = paymentService.getAllPayments(java.util.Optional.of(paymentStatus));
                } catch (IllegalArgumentException e) {
                    response.put("success", false);
                    response.put("message", "Invalid payment status: " + status);
                    response.put("data", List.of());
                    response.put("count", 0);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            } else {
                payments = paymentService.getAllPayments(java.util.Optional.empty());
            }

            response.put("success", true);
            response.put("data", payments);
            response.put("count", payments.size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException exception) {
            log.warn("Falling back to empty payment list because the database is unavailable: {}", exception.getMessage());
            response.put("success", false);
            response.put("message", "Payment history is temporarily unavailable");
            response.put("data", List.of());
            response.put("count", 0);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Initiates a new payment
     * POST /payments/initiate
     */
    @PostMapping("/initiate")
    public CompletableFuture<ResponseEntity<PaymentResponseDTO>> initiatePayment(@Valid @RequestBody PaymentRequestDTO request) {
        log.info("Payment initiation request received for consultation: {}", request.getConsultationId());
        return paymentService.initiatePayment(request)
                .thenApply(response -> {
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error initiating payment", ex);
                    PaymentResponseDTO errorResponse = PaymentResponseDTO.builder()
                            .success(false)
                            .message("Error initiating payment: " + ex.getMessage())
                            .build();
                    return ResponseEntity.ok(errorResponse);
                });
    }

    /**
     * Confirms a payment after client-side payment method submission
     * POST /payments/{paymentId}/confirm
     */
    @PostMapping("/{paymentId}/confirm")
    public CompletableFuture<ResponseEntity<PaymentResponseDTO>> confirmPayment(
            @PathVariable String paymentId,
            @RequestParam String paymentMethodId) {
        log.info("Payment confirmation request received for payment: {}", paymentId);
        return paymentService.confirmPayment(paymentId, paymentMethodId)
                .thenApply(response -> {
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error confirming payment", ex);
                    PaymentResponseDTO errorResponse = PaymentResponseDTO.builder()
                            .success(false)
                            .message("Error confirming payment: " + ex.getMessage())
                            .build();
                    return ResponseEntity.ok(errorResponse);
                });
    }

    /**
     * Retrieves payment details by payment ID
     * GET /payments/{paymentId}
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> getPayment(@PathVariable String paymentId) {
        log.info("Fetching payment details for: {}", paymentId);
        try {
            PaymentResponseDTO response = paymentService.getPaymentById(paymentId);
            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (RuntimeException exception) {
            log.warn("Payment lookup unavailable for {}: {}", paymentId, exception.getMessage());
            return ResponseEntity.ok(PaymentResponseDTO.builder()
                    .success(false)
                    .message("Payment details are temporarily unavailable")
                    .build());
        }
    }

    /**
     * Retrieves all payments for a specific patient
     * GET /payments/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Map<String, Object>> getPatientPayments(@PathVariable String patientId) {
        log.info("Fetching payments for patient: {}", patientId);
        Map<String, Object> response = new HashMap<>();
        try {
            List<PaymentResponseDTO> payments = paymentService.getPaymentsByPatient(patientId);
            response.put("success", true);
            response.put("data", payments);
            response.put("count", payments.size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException exception) {
            log.warn("Payment history unavailable for patient {}: {}", patientId, exception.getMessage());
            response.put("success", false);
            response.put("message", "Payment history is temporarily unavailable");
            response.put("data", List.of());
            response.put("count", 0);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Retrieves all payments for a specific doctor
     * GET /payments/doctor/{doctorId}
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<Map<String, Object>> getDoctorPayments(
            @PathVariable String doctorId,
            @RequestParam(required = false) String status) {
        log.info("Fetching payments for doctor: {} with status: {}", doctorId, status);

        Map<String, Object> response = new HashMap<>();
        try {
            List<PaymentResponseDTO> payments;
            if (status != null && !status.isEmpty()) {
                try {
                    Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
                    payments = paymentService.getPaymentHistoryForDoctor(doctorId, paymentStatus);
                } catch (IllegalArgumentException e) {
                    response.put("success", false);
                    response.put("message", "Invalid payment status: " + status);
                    response.put("data", List.of());
                    response.put("count", 0);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            } else {
                payments = paymentService.getPaymentsByDoctor(doctorId);
            }

            response.put("success", true);
            response.put("data", payments);
            response.put("count", payments.size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException exception) {
            log.warn("Payment history unavailable for doctor {}: {}", doctorId, exception.getMessage());
            response.put("success", false);
            response.put("message", "Payment history is temporarily unavailable");
            response.put("data", List.of());
            response.put("count", 0);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Retrieves payment for a specific consultation
     * GET /payments/consultation/{consultationId}
     */
    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<PaymentResponseDTO> getConsultationPayment(@PathVariable String consultationId) {
        log.info("Fetching payment for consultation: {}", consultationId);
        try {
            PaymentResponseDTO response = paymentService.getPaymentByConsultation(consultationId);
            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (RuntimeException exception) {
            log.warn("Consultation payment unavailable for {}: {}", consultationId, exception.getMessage());
            return ResponseEntity.ok(PaymentResponseDTO.builder()
                    .success(false)
                    .message("Consultation payment is temporarily unavailable")
                    .build());
        }
    }

    /**
     * Processes a refund
     * POST /payments/{paymentId}/refund
     */
    @PostMapping("/{paymentId}/refund")
    public CompletableFuture<ResponseEntity<PaymentResponseDTO>> refundPayment(
            @PathVariable String paymentId,
            @Valid @RequestBody RefundRequestDTO request) {
        log.info("Refund request received for payment: {}", paymentId);
        request.setPaymentId(paymentId);
        
        return paymentService.refundPayment(request)
                .thenApply(response -> {
                    return ResponseEntity.ok(response);
                })
                .exceptionally(ex -> {
                    log.error("Error processing refund", ex);
                    PaymentResponseDTO errorResponse = PaymentResponseDTO.builder()
                            .success(false)
                            .message("Error processing refund: " + ex.getMessage())
                            .build();
                    return ResponseEntity.ok(errorResponse);
                });
    }

    /**
     * Retrieves payment history for a patient
     * GET /payments/history/{patientId}
     */
    @GetMapping("/history/{patientId}")
    public ResponseEntity<Map<String, Object>> getPaymentHistory(
            @PathVariable String patientId,
            @RequestParam(required = false) String status) {
        log.info("Fetching payment history for patient: {} with status: {}", patientId, status);

        Map<String, Object> response = new HashMap<>();
        try {
            List<PaymentResponseDTO> payments;
            if (status != null && !status.isEmpty()) {
                try {
                    Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
                    payments = paymentService.getPaymentHistory(patientId, paymentStatus);
                } catch (IllegalArgumentException e) {
                    response.put("success", false);
                    response.put("message", "Invalid payment status: " + status);
                    response.put("data", List.of());
                    response.put("count", 0);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
            } else {
                payments = paymentService.getPaymentsByPatient(patientId);
            }

            response.put("success", true);
            response.put("data", payments);
            response.put("count", payments.size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException exception) {
            log.warn("Falling back to empty payment history for patient {} because the database is unavailable: {}", patientId, exception.getMessage());
            response.put("success", false);
            response.put("message", "Payment history is temporarily unavailable");
            response.put("data", List.of());
            response.put("count", 0);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Health check endpoint
     * GET /payments/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "payment-service");
        return ResponseEntity.ok(response);
    }
}
