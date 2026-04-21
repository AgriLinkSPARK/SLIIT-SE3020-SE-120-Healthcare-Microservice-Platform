package com.sliit.healthcare.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {

    private String id;

    private String consultationId;

    private String patientId;

    private String doctorId;

    private BigDecimal amount;

    private String currency;

    private String status;

    private String paymentMethod;

    private String transactionId;

    private String description;

    private String customerEmail;

    private String customerName;

    private String paymentToken;

    private String checkoutUrl;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidAt;

    private String receiptUrl;

    private String failureReason;

    private Boolean refundRequested;

    private String refundId;

    private Boolean success;

    private String message;
}
