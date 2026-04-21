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
public class DiagnosisResponseDto {
    private String id;
    private String patientId;
    private String condition;
    private String plainLanguageDescription;
    private LocalDate diagnosedDate;
    private String status;
    private LocalDateTime createdAt;
}
