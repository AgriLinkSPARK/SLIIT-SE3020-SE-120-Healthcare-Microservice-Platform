package com.sliit.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImmunizationResponseDto {
    private String id;
    private String patientId;
    private String vaccineName;
    private LocalDate administeredDate;
    private LocalDate nextDueDate;
    private String administeredBy;
    private String batchNumber;
    private LocalDateTime createdAt;
}
