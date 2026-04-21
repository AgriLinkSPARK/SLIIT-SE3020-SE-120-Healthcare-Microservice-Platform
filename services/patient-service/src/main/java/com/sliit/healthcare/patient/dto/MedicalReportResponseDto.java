package com.sliit.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalReportResponseDto {
    private String id;
    private String title;
    private String description;
    private String fileUrl;
}
