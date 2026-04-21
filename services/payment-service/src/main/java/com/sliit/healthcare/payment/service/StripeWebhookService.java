package com.sliit.healthcare.payment.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sliit.healthcare.payment.entity.Payment;
import com.sliit.healthcare.payment.repository.PaymentRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StripeWebhookService {

    private final PaymentRepository paymentRepository;
    
    @Value("${stripe.webhook.secret:whsec_}")
    private String webhookSecret;

    public StripeWebhookService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Processes Stripe webhook events asynchronously
     */
    @Async("paymentProcessingExecutor")
    @Transactional
    public void processStripeEvent(String payload, String sigHeader) {
        try {
            // Verify webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("Processing Stripe event: {}", event.getType());

            // Handle different event types
            switch (event.getType()) {
                case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
                case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
                case "payment_intent.canceled" -> handlePaymentIntentCanceled(event);
                case "charge.refunded" -> handleChargeRefunded(event);
                default -> log.info("Unhandled event type: {}", event.getType());
            }
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid webhook signature", e);
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Error processing webhook", e);
        }
    }

    /**
     * Handles payment_intent.succeeded event
     */
    private void handlePaymentIntentSucceeded(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        PaymentIntent paymentIntent = (PaymentIntent) deserializer.getObject().orElse(null);

        if (paymentIntent != null) {
            String paymentIntentId = paymentIntent.getId();
            log.info("Payment intent succeeded: {}", paymentIntentId);

            Optional<Payment> optionalPayment = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
            if (optionalPayment.isPresent()) {
                Payment payment = optionalPayment.get();
                payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
                payment.setPaidAt(LocalDateTime.now());
                payment.setTransactionId(paymentIntentId);
                paymentRepository.save(payment);
                log.info("Payment status updated to SUCCEEDED: {}", payment.getId());
            }
        }
    }

    /**
     * Handles payment_intent.payment_failed event
     */
    private void handlePaymentIntentFailed(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        PaymentIntent paymentIntent = (PaymentIntent) deserializer.getObject().orElse(null);

        if (paymentIntent != null) {
            String paymentIntentId = paymentIntent.getId();
            log.info("Payment intent failed: {}", paymentIntentId);

            Optional<Payment> optionalPayment = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
            if (optionalPayment.isPresent()) {
                Payment payment = optionalPayment.get();
                payment.setStatus(Payment.PaymentStatus.FAILED);
                if (paymentIntent.getLastPaymentError() != null) {
                    payment.setFailureReason(paymentIntent.getLastPaymentError().getMessage());
                }
                paymentRepository.save(payment);
                log.info("Payment status updated to FAILED: {}", payment.getId());
            }
        }
    }

    /**
     * Handles payment_intent.canceled event
     */
    private void handlePaymentIntentCanceled(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        PaymentIntent paymentIntent = (PaymentIntent) deserializer.getObject().orElse(null);

        if (paymentIntent != null) {
            String paymentIntentId = paymentIntent.getId();
            log.info("Payment intent canceled: {}", paymentIntentId);

            Optional<Payment> optionalPayment = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
            if (optionalPayment.isPresent()) {
                Payment payment = optionalPayment.get();
                payment.setStatus(Payment.PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
                log.info("Payment status updated to CANCELLED: {}", payment.getId());
            }
        }
    }

    /**
     * Handles charge.refunded event
     */
    private void handleChargeRefunded(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        com.stripe.model.Charge charge = (com.stripe.model.Charge) deserializer.getObject().orElse(null);

        if (charge != null && charge.getPaymentIntent() != null) {
            String paymentIntentId = charge.getPaymentIntent();
            log.info("Charge refunded for payment intent: {}", paymentIntentId);

            Optional<Payment> optionalPayment = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
            if (optionalPayment.isPresent()) {
                Payment payment = optionalPayment.get();
                payment.setStatus(Payment.PaymentStatus.REFUNDED);
                payment.setRefundId(charge.getRefunded() ? charge.getId() : null);
                paymentRepository.save(payment);
                log.info("Payment status updated to REFUNDED: {}", payment.getId());
            }
        }
    }

    /**
     * Handles retries for failed webhook processing
     */
    @Async("paymentProcessingExecutor")
    @Transactional
    public void retryFailedWebhookProcessing() {
        try {
            log.info("Checking for pending payments to retry");
            // This can be extended to retry failed payments
        } catch (Exception e) {
            log.error("Error in retry processor: {}", e.getMessage(), e);
        }
    }
}
