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
public class MedicalReportRequestDto {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
}
