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
public class MedicationRequestDto {
    @NotBlank(message = "Medication name is required")
    private String medicationName;

    private String dosage;
    private String frequency;
    private String sideEffects;
    private String prescribedBy;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
}
