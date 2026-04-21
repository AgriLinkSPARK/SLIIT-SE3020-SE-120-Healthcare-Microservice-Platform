package com.sliit.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponseDto {
    private String id;
    private String patientId;
    private String description;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String status;
    private LocalDateTime paidAt;
    private String paymentMethod;
    private LocalDateTime createdAt;
}
