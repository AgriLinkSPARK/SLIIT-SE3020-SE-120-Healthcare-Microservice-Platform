package com.sliit.healthcare.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    private String id;
    
    private String consultationId;
    
    private String patientId;
    
    private String doctorId;
    
    private BigDecimal amount;
    
    private String currency;
    
    private PaymentStatus status;
    
    private PaymentMethod paymentMethod;
    
    private String stripePaymentIntentId;
    
    private String stripeCustomerId;
    
    private String transactionId;
    
    private String description;

    private String customerEmail;

    private String customerName;

    private String paymentToken;

    private String gatewayCheckoutUrl;
    
    private String failureReason;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private LocalDateTime paidAt;
    
    private String receiptUrl;
    
    private String refundId;
    
    private Boolean refundRequested;

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        SUCCEEDED,
        FAILED,
        CANCELLED,
        REFUNDED,
        PARTIAL_REFUND
    }

    public enum PaymentMethod {
        STRIPE,
        PAYHERE,
        DIALOG_GENIE,
        FRIMI,
        PAYPAL
    }
}
