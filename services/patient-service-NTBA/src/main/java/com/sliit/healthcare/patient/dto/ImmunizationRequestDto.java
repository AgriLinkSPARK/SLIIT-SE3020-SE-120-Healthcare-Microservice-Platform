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
public class ImmunizationRequestDto {
    @NotBlank(message = "Vaccine name is required")
    private String vaccineName;

    private LocalDate administeredDate;
    private LocalDate nextDueDate;
    private String administeredBy;
    private String batchNumber;
}
