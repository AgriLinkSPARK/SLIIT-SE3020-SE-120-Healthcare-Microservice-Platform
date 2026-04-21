package com.sliit.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisRequestDto {
    @NotBlank(message = "Condition is required")
    private String condition;

    private String plainLanguageDescription;
    private LocalDate diagnosedDate;
    private String status;
}
