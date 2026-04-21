package com.sliit.healthcare.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDTO {

    @NotBlank(message = "Payment ID is required")
    private String paymentId;

    private BigDecimal amount;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String notes;
}
