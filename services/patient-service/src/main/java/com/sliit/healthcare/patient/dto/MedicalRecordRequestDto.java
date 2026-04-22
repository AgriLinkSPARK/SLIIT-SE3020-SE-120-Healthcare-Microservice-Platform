package com.sliit.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordRequestDto {
    @NotNull(message = "Record type is required")
    private String recordType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String fileUrl;
    private LocalDate recordDate;
}
