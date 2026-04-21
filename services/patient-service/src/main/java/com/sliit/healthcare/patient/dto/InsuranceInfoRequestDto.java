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
public class InsuranceInfoRequestDto {
    @NotBlank(message = "Provider is required")
    private String provider;

    @NotBlank(message = "Policy number is required")
    private String policyNumber;

    private String groupNumber;
    private LocalDate coverageStartDate;
    private LocalDate coverageEndDate;
    private Boolean isPrimary;
}
