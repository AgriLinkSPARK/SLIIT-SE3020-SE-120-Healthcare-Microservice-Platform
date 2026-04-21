package com.sliit.healthcare.payment.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sliit.healthcare.payment.dto.PaymentRequestDTO;
import com.sliit.healthcare.payment.dto.PaymentResponseDTO;
import com.sliit.healthcare.payment.dto.RefundRequestDTO;
import com.sliit.healthcare.payment.entity.Payment;
import com.sliit.healthcare.payment.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SriLankanPaymentGatewayService sriLankanPaymentGatewayService;

    @Value("${payment.success-redirect-url:http://localhost:3000/payment/success}")
    private String paymentSuccessRedirectUrl;

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Value("${paypal.sandbox.checkout-url:https://www.sandbox.paypal.com/checkoutnow}")
    private String payPalSandboxCheckoutUrl;

    public PaymentService(PaymentRepository paymentRepository,
                          SriLankanPaymentGatewayService sriLankanPaymentGatewayService) {
        this.paymentRepository = paymentRepository;
        this.sriLankanPaymentGatewayService = sriLankanPaymentGatewayService;
    }

    @Transactional
    @Async("paymentProcessingExecutor")
    public CompletableFuture<PaymentResponseDTO> initiatePayment(PaymentRequestDTO request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Initiating payment for consultation: {}", request.getConsultationId());

                Payment.PaymentMethod paymentMethod = parsePaymentMethod(request.getPaymentMethod());
                return switch (paymentMethod) {
                    case STRIPE -> initiateStripePayment(request);
                    case PAYHERE, DIALOG_GENIE, FRIMI -> initiateLocalGatewayPayment(request, paymentMethod);
                    case PAYPAL -> initiatePayPalSandboxPayment(request);
                };
            } catch (StripeException e) {
                log.error("Stripe error initiating payment: {}", e.getMessage(), e);
                return createErrorResponse("Error initiating payment: " + e.getMessage());
            } catch (IllegalArgumentException e) {
                log.error("Invalid payment initiation request: {}", e.getMessage(), e);
                return createErrorResponse(e.getMessage());
            } catch (RuntimeException e) {
                log.error("Error initiating payment: {}", e.getMessage(), e);
                return createErrorResponse("Error initiating payment: " + e.getMessage());
            }
        });
    }

    private PaymentResponseDTO initiateStripePayment(PaymentRequestDTO request) throws StripeException {
        ensureStripeConfigured();
        PaymentIntent paymentIntent = createPaymentIntent(request);

        Payment payment = basePaymentBuilder(request, Payment.PaymentMethod.STRIPE)
                .stripePaymentIntentId(paymentIntent.getId())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Stripe payment record created with ID: {}", savedPayment.getId());

        return mapToResponseDTO(savedPayment, "Stripe payment initiated successfully", true);
    }

    private PaymentResponseDTO initiateLocalGatewayPayment(PaymentRequestDTO request,
                                                           Payment.PaymentMethod paymentMethod) {
        SriLankanPaymentGatewayService.GatewayInitiationResult result =
                sriLankanPaymentGatewayService.buildGatewayCheckout(request, paymentMethod);

        Payment payment = basePaymentBuilder(request, paymentMethod)
                .transactionId(result.transactionId())
                .gatewayCheckoutUrl(result.checkoutUrl())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("{} payment record created with ID: {}", paymentMethod, savedPayment.getId());

        return mapToResponseDTO(savedPayment, result.message(), true);
    }

    private PaymentResponseDTO initiatePayPalSandboxPayment(PaymentRequestDTO request) {
        String transactionId = "PP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        String checkoutUrl = payPalSandboxCheckoutUrl + "?token=" + transactionId;

        Payment payment = basePaymentBuilder(request, Payment.PaymentMethod.PAYPAL)
                .transactionId(transactionId)
                .gatewayCheckoutUrl(checkoutUrl)
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("PayPal sandbox payment record created with ID: {}", savedPayment.getId());

        return mapToResponseDTO(savedPayment, "PayPal sandbox checkout URL created", true);
    }

    private Payment.PaymentMethod parsePaymentMethod(String paymentMethod) {
        try {
            return Payment.PaymentMethod.valueOf(paymentMethod.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported payment method: " + paymentMethod);
        }
    }

    public PaymentResponseDTO processPayHereCallback(Map<String, String> callbackParams, boolean cancelFlow) {
        String orderId = firstNonBlank(
                callbackParams.get("order_id"),
                callbackParams.get("order_reference"),
                callbackParams.get("payment_id")
        );

        if (orderId == null) {
            return createErrorResponse("Missing order_id in PayHere callback");
        }

        Optional<Payment> optionalPayment = paymentRepository.findByTransactionId(orderId);
        if (optionalPayment.isEmpty()) {
            return createErrorResponse("Payment not found for order ID: " + orderId);
        }

        Payment payment = optionalPayment.get();
        String statusCode = firstNonBlank(callbackParams.get("status_code"), cancelFlow ? "-1" : null);

        if (statusCode == null) {
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setFailureReason("Pending confirmation from PayHere");
        } else {
            switch (statusCode) {
                case "2" -> {
                    payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
                    payment.setFailureReason(null);
                    payment.setPaidAt(LocalDateTime.now());
                }
                case "0" -> {
                    payment.setStatus(Payment.PaymentStatus.PENDING);
                    payment.setFailureReason("Payment is pending");
                }
                case "-1" -> {
                    payment.setStatus(Payment.PaymentStatus.CANCELLED);
                    payment.setFailureReason("Payment cancelled by customer");
                }
                default -> {
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    payment.setFailureReason("PayHere status code: " + statusCode);
                }
            }
        }

        payment.setUpdatedAt(LocalDateTime.now());
        Payment updatedPayment = paymentRepository.save(payment);

        String message = "PayHere callback processed with status " + updatedPayment.getStatus();
        return mapToResponseDTO(updatedPayment, message, true);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private Payment.PaymentBuilder basePaymentBuilder(PaymentRequestDTO request, Payment.PaymentMethod paymentMethod) {
        return Payment.builder()
                .consultationId(request.getConsultationId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .status(Payment.PaymentStatus.PENDING)
                .paymentMethod(paymentMethod)
                .description(request.getDescription())
                .customerEmail(request.getCustomerEmail())
                .customerName(request.getCustomerName())
                .paymentToken(request.getPaymentToken())
                .refundRequested(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now());
    }

    /**
     * Creates a Stripe Payment Intent
     */
    private PaymentIntent createPaymentIntent(PaymentRequestDTO request) throws StripeException {
        long amountInCents = request.getAmount().multiply(new BigDecimal(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(request.getCurrency().toLowerCase())
                .setDescription(request.getDescription())
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                    .build())
                .putMetadata("consultationId", request.getConsultationId())
                .putMetadata("patientId", request.getPatientId())
                .putMetadata("doctorId", request.getDoctorId())
                .setConfirm(false)
                .build();

        return PaymentIntent.create(params);
    }

    /**
     * Confirms a payment after client-side token submission
     */
    @Transactional
    @Async("paymentProcessingExecutor")
    public CompletableFuture<PaymentResponseDTO> confirmPayment(String paymentId, String paymentMethodId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Confirming payment: {}", paymentId);
                ensureStripeConfigured();

                Optional<Payment> optionalPayment = paymentRepository.findById(paymentId);
                if (optionalPayment.isEmpty()) {
                    return createErrorResponse("Payment not found");
                }

                Payment payment = optionalPayment.get();
                if (!Payment.PaymentMethod.STRIPE.equals(payment.getPaymentMethod())) {
                    return createErrorResponse("Payment confirmation is supported only for Stripe card payments");
                }

                PaymentIntent paymentIntent = PaymentIntent.retrieve(payment.getStripePaymentIntentId());

                // Confirm payment with payment method
                PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder()
                        .setPaymentMethod(paymentMethodId)
                    .setReturnUrl(paymentSuccessRedirectUrl)
                        .build();

                PaymentIntent confirmedIntent = paymentIntent.confirm(params);

                payment.setPaymentToken(paymentMethodId);
                switch (confirmedIntent.getStatus()) {
                    case "succeeded" -> {
                        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
                        payment.setPaidAt(LocalDateTime.now());
                        payment.setTransactionId(confirmedIntent.getId());
                    }
                    case "requires_action" -> payment.setStatus(Payment.PaymentStatus.PROCESSING);
                    default -> {
                        payment.setStatus(Payment.PaymentStatus.FAILED);
                        payment.setFailureReason(confirmedIntent.getLastPaymentError() != null ?
                            confirmedIntent.getLastPaymentError().getMessage() : "Unknown error");
                    }
                }

                payment.setUpdatedAt(LocalDateTime.now());

                Payment updatedPayment = paymentRepository.save(payment);
                log.info("Payment confirmed with status: {}", updatedPayment.getStatus());

                return mapToResponseDTO(updatedPayment, "Payment confirmed", true);
            } catch (StripeException e) {
                log.error("Stripe error confirming payment: {}", e.getMessage(), e);
                return createErrorResponse("Error confirming payment: " + e.getMessage());
            } catch (RuntimeException e) {
                log.error("Error confirming payment: {}", e.getMessage(), e);
                return createErrorResponse("Error confirming payment: " + e.getMessage());
            }
        });
    }

    /**
     * Retrieves a payment by ID
     */
    public PaymentResponseDTO getPaymentById(String paymentId) {
        log.info("Fetching payment with ID: {}", paymentId);
        Optional<Payment> payment = paymentRepository.findById(paymentId);
        
        if (payment.isPresent()) {
            return mapToResponseDTO(payment.get(), "Payment retrieved successfully", true);
        } else {
            return createErrorResponse("Payment not found");
        }
    }

    /**
     * Retrieves all payments for a patient
     */
    public List<PaymentResponseDTO> getPaymentsByPatient(String patientId) {
        log.info("Fetching payments for patient: {}", patientId);
        return paymentRepository.findByPatientId(patientId).stream()
                .map(p -> mapToResponseDTO(p, "", true))
                .toList();
    }

    /**
     * Retrieves all payments for a doctor
     */
    public List<PaymentResponseDTO> getPaymentsByDoctor(String doctorId) {
        log.info("Fetching payments for doctor: {}", doctorId);
        return paymentRepository.findByDoctorId(doctorId).stream()
                .map(p -> mapToResponseDTO(p, "", true))
                .toList();
    }

    /**
     * Retrieves all payments, optionally filtered by status
     */
    public List<PaymentResponseDTO> getAllPayments(Optional<Payment.PaymentStatus> status) {
        log.info("Fetching all payments with status filter: {}", status.orElse(null));

        return status
                .map(paymentRepository::findByStatus)
                .orElseGet(paymentRepository::findAll)
                .stream()
                .sorted(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(p -> mapToResponseDTO(p, "", true))
                .toList();
    }

    /**
     * Retrieves payment by consultation ID
     */
    public PaymentResponseDTO getPaymentByConsultation(String consultationId) {
        log.info("Fetching payment for consultation: {}", consultationId);
        Optional<Payment> payment = paymentRepository.findByConsultationId(consultationId);
        
        if (payment.isPresent()) {
            return mapToResponseDTO(payment.get(), "Payment retrieved successfully", true);
        } else {
            return createErrorResponse("Payment not found for consultation");
        }
    }

    /**
     * Processes a refund asynchronously
     */
    @Transactional
    @Async("paymentProcessingExecutor")
    public CompletableFuture<PaymentResponseDTO> refundPayment(RefundRequestDTO request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Processing refund for payment: {}", request.getPaymentId());
                ensureStripeConfigured();

                Optional<Payment> optionalPayment = paymentRepository.findById(request.getPaymentId());
                if (optionalPayment.isEmpty()) {
                    return createErrorResponse("Payment not found");
                }

                Payment payment = optionalPayment.get();

                if (!Payment.PaymentMethod.STRIPE.equals(payment.getPaymentMethod())) {
                    return createErrorResponse("Refund is currently supported only for Stripe payments");
                }

                if (!Payment.PaymentStatus.SUCCEEDED.equals(payment.getStatus())) {
                    return createErrorResponse("Only succeeded payments can be refunded");
                }

                // Create Stripe refund
                RefundCreateParams.Builder refundBuilder = RefundCreateParams.builder()
                        .setPaymentIntent(payment.getStripePaymentIntentId())
                    .setReason(RefundCreateParams.Reason.valueOf(request.getReason().toUpperCase()));

                if (request.getAmount() != null) {
                    long amountInCents = request.getAmount().multiply(new BigDecimal(100)).longValue();
                    refundBuilder.setAmount(amountInCents);
                }

                RefundCreateParams params = refundBuilder.build();

                Refund refund = Refund.create(params);

                // Update payment record
                if ("succeeded".equals(refund.getStatus())) {
                    payment.setStatus(request.getAmount() != null && 
                        request.getAmount().compareTo(payment.getAmount()) < 0 ? 
                        Payment.PaymentStatus.PARTIAL_REFUND : Payment.PaymentStatus.REFUNDED);
                    payment.setRefundId(refund.getId());
                    payment.setRefundRequested(false);
                }

                payment.setUpdatedAt(LocalDateTime.now());

                Payment updatedPayment = paymentRepository.save(payment);
                log.info("Refund processed successfully: {}", refund.getId());

                return mapToResponseDTO(updatedPayment, "Refund processed successfully", true);
            } catch (StripeException e) {
                log.error("Stripe error processing refund: {}", e.getMessage(), e);
                return createErrorResponse("Error processing refund: " + e.getMessage());
            } catch (RuntimeException e) {
                log.error("Error processing refund: {}", e.getMessage(), e);
                return createErrorResponse("Error processing refund: " + e.getMessage());
            }
        });
    }

    /**
     * Helper method to map Payment entity to DTO
     */
    private PaymentResponseDTO mapToResponseDTO(Payment payment, String message, Boolean success) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .consultationId(payment.getConsultationId())
                .patientId(payment.getPatientId())
                .doctorId(payment.getDoctorId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().toString())
                .paymentMethod(payment.getPaymentMethod().toString())
                .transactionId(payment.getTransactionId())
                .description(payment.getDescription())
                .customerEmail(payment.getCustomerEmail())
                .customerName(payment.getCustomerName())
                .paymentToken(payment.getPaymentToken())
                .checkoutUrl(payment.getGatewayCheckoutUrl())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .receiptUrl(payment.getReceiptUrl())
                .failureReason(payment.getFailureReason())
                .refundRequested(payment.getRefundRequested())
                .refundId(payment.getRefundId())
                .success(success)
                .message(message)
                .build();
    }

    /**
     * Helper method to create error response
     */
    private PaymentResponseDTO createErrorResponse(String message) {
        return PaymentResponseDTO.builder()
                .success(false)
                .message(message)
                .build();
    }

    private void ensureStripeConfigured() {
        if (stripeApiKey == null || stripeApiKey.isBlank()
                || stripeApiKey.contains("dummy")
                || stripeApiKey.contains("YOUR")
                || stripeApiKey.contains("REPLACE_WITH")) {
            throw new IllegalStateException(
                    "Stripe is not configured. Set STRIPE_API_KEY to a real test or live secret key before using Stripe payments.");
        }
    }

    /**
     * Retrieves payment history for analytics
     */
    public List<PaymentResponseDTO> getPaymentHistory(String patientId, Payment.PaymentStatus status) {
        log.info("Fetching payment history for patient: {} with status: {}", patientId, status);
        return paymentRepository.findByPatientIdAndStatus(patientId, status).stream()
                .map(p -> mapToResponseDTO(p, "", true))
                .toList();
    }

    /**
     * Retrieves payment history for a doctor with an optional status filter.
     */
    public List<PaymentResponseDTO> getPaymentHistoryForDoctor(String doctorId, Payment.PaymentStatus status) {
        log.info("Fetching payment history for doctor: {} with status: {}", doctorId, status);
        return paymentRepository.findByDoctorIdAndStatus(doctorId, status).stream()
                .map(p -> mapToResponseDTO(p, "", true))
                .toList();
    }
}
