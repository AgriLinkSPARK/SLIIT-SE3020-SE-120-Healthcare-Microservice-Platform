package com.sliit.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDataRequestDto {
    @NotBlank(message = "Data type is required")
    private String dataType;

    @NotBlank(message = "Value is required")
    private String value;

    private String unit;
    private String notes;
}
