package com.sliit.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllergyResponseDto {
    private String id;
    private String patientId;
    private String allergyName;
    private String severity;
    private String reaction;
    private String notes;
    private LocalDateTime createdAt;
}
