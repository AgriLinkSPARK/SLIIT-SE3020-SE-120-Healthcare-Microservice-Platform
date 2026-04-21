package com.sliit.healthcare.payment.service;

import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sliit.healthcare.payment.dto.PaymentRequestDTO;
import com.sliit.healthcare.payment.entity.Payment;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SriLankanPaymentGatewayService {

    @Value("${payment.gateways.payhere.checkout-url:https://sandbox.payhere.lk/pay/checkout}")
    private String payHereCheckoutUrl;

    @Value("${payment.gateways.payhere.merchant-id:}")
    private String payHereMerchantId;

    @Value("${payment.gateways.dialog-genie.checkout-url:https://sandbox.dialoggenie.lk/checkout}")
    private String dialogGenieCheckoutUrl;

    @Value("${payment.gateways.dialog-genie.merchant-id:}")
    private String dialogGenieMerchantId;

    @Value("${payment.gateways.dialog-genie.secret:}")
    private String dialogGenieSecret;

    @Value("${payment.gateways.frimi.checkout-url:https://sandbox.frimi.lk/checkout}")
    private String friMiCheckoutUrl;

    @Value("${payment.gateways.frimi.merchant-code:}")
    private String friMiMerchantCode;

    @Value("${payment.success-redirect-url:http://localhost:3000/payment/success}")
    private String successRedirectUrl;

    @Value("${payment.failure-redirect-url:http://localhost:3000/payment/failure}")
    private String failureRedirectUrl;

    @Value("${payment.gateways.payhere.return-url:http://localhost:8004/api/v1/webhooks/payhere/return}")
    private String payHereReturnUrl;

    @Value("${payment.gateways.payhere.cancel-url:http://localhost:8004/api/v1/webhooks/payhere/cancel}")
    private String payHereCancelUrl;

    @Value("${payment.gateways.payhere.notify-url:http://localhost:8004/api/v1/webhooks/payhere/notify}")
    private String payHereNotifyUrl;

    public GatewayInitiationResult buildGatewayCheckout(PaymentRequestDTO request, Payment.PaymentMethod method) {
        return switch (method) {
            case PAYHERE -> buildPayHereCheckout(request);
            case DIALOG_GENIE -> buildDialogGenieCheckout(request);
            case FRIMI -> buildFriMiCheckout(request);
            default -> throw new IllegalArgumentException("Unsupported local gateway method: " + method);
        };
    }

    private GatewayInitiationResult buildPayHereCheckout(PaymentRequestDTO request) {
        String transactionId = "PH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        if (payHereMerchantId == null || payHereMerchantId.isBlank()) {
            log.warn("PAYHERE_MERCHANT_ID is not set. Building sandbox checkout URL without merchant_id.");
        }

        Map<String, String> query = new LinkedHashMap<>();
        query.put("merchant_id", payHereMerchantId);
        query.put("return_url", payHereReturnUrl);
        query.put("cancel_url", payHereCancelUrl);
        query.put("notify_url", payHereNotifyUrl);
        query.put("order_id", transactionId);
        query.put("items", request.getDescription());
        query.put("currency", request.getCurrency());
        query.put("amount", request.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString());
        query.put("first_name", safeNamePart(request.getCustomerName()));
        query.put("email", nullToEmpty(request.getCustomerEmail()));
        query.put("custom_1", request.getConsultationId());

        return new GatewayInitiationResult(
                transactionId,
                buildUrl(payHereCheckoutUrl, query),
                "PayHere checkout URL created"
        );
    }

    private GatewayInitiationResult buildDialogGenieCheckout(PaymentRequestDTO request) {
        String transactionId = "DG-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        String amount = request.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString();
        String signatureInput = dialogGenieMerchantId + transactionId + amount + dialogGenieSecret;

        if (dialogGenieMerchantId == null || dialogGenieMerchantId.isBlank()) {
            log.warn("DIALOG_GENIE_MERCHANT_ID is not set. Building sandbox checkout URL without merchant_id.");
        }

        Map<String, String> query = new LinkedHashMap<>();
        query.put("merchant_id", dialogGenieMerchantId);
        query.put("order_id", transactionId);
        query.put("amount", amount);
        query.put("currency", request.getCurrency());
        query.put("description", request.getDescription());
        query.put("redirect_url", successRedirectUrl);
        query.put("cancel_url", failureRedirectUrl);
        query.put("customer_email", nullToEmpty(request.getCustomerEmail()));
        query.put("customer_name", nullToEmpty(request.getCustomerName()));
        query.put("signature", sha256Hex(signatureInput));

        return new GatewayInitiationResult(
                transactionId,
                buildUrl(dialogGenieCheckoutUrl, query),
                "Dialog Genie checkout URL created"
        );
    }

    private GatewayInitiationResult buildFriMiCheckout(PaymentRequestDTO request) {
        String transactionId = "FR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        if (friMiMerchantCode == null || friMiMerchantCode.isBlank()) {
            log.warn("FRIMI_MERCHANT_CODE is not set. Building sandbox checkout URL without merchant_code.");
        }

        Map<String, String> query = new LinkedHashMap<>();
        query.put("merchant_code", friMiMerchantCode);
        query.put("order_reference", transactionId);
        query.put("amount", request.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString());
        query.put("currency", request.getCurrency());
        query.put("description", request.getDescription());
        query.put("customer_email", nullToEmpty(request.getCustomerEmail()));
        query.put("customer_name", nullToEmpty(request.getCustomerName()));
        query.put("return_url", successRedirectUrl);
        query.put("cancel_url", failureRedirectUrl);

        return new GatewayInitiationResult(
                transactionId,
                buildUrl(friMiCheckoutUrl, query),
                "FriMi checkout URL created"
        );
    }

    private String buildUrl(String baseUrl, Map<String, String> params) {
        String query = params.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> urlEncode(entry.getKey()) + "=" + urlEncode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");

        if (query.isEmpty()) {
            return baseUrl;
        }
        return baseUrl + (baseUrl.contains("?") ? "&" : "?") + query;
    }

    private String safeNamePart(String customerName) {
        if (customerName == null || customerName.isBlank()) {
            return "Patient";
        }
        return customerName.trim().split("\\s+")[0];
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private String urlEncode(String input) {
        return URLEncoder.encode(input, StandardCharsets.UTF_8);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("Error generating SHA-256 signature", e);
            throw new IllegalStateException("Unable to generate signature", e);
        }
    }

    public record GatewayInitiationResult(String transactionId, String checkoutUrl, String message) {
    }
}
