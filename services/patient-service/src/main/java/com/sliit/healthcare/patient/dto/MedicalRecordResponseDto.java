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
public class MedicalRecordResponseDto {
    private String id;
    private String patientId;
    private String recordType;
    private String title;
    private String description;
    private String fileUrl;
    private LocalDate recordDate;
    private LocalDateTime createdAt;
}
