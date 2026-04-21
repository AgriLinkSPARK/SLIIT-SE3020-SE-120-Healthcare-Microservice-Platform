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
public class AllergyRequestDto {
    @NotBlank(message = "Allergy name is required")
    private String allergyName;

    private String severity;
    private String reaction;
    private String notes;
}
