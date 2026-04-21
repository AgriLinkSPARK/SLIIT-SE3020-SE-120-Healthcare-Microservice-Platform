package com.sliit.healthcare.patient.dto;

import com.sliit.healthcare.patient.model.Prescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponseDto {

    private String id;
    private String patientId;
    private String doctorId;
    private String doctorName;
    private String appointmentId;
    private String diagnosis;
    private String notes;
    private LocalDate prescriptionDate;
    private LocalDate validUntil;
    private List<PrescribedMedicationDto> medications;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescribedMedicationDto {
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
