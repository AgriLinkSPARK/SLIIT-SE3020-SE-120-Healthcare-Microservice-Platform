package com.sliit.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryResponseDto {

    private String patientId;
    private String patientName;
    
    // Summary counts
    private int totalAppointments;
    private int totalPrescriptions;
    private int totalMedications;
    private int totalRecords;
    
    // Recent data
    private List<AppointmentResponseDto> recentAppointments;
    private List<PrescriptionResponseDto> recentPrescriptions;
    private List<MedicationResponseDto> activeMedications;
    private List<MedicalRecordResponseDto> recentRecords;
    private List<DiagnosisResponseDto> diagnoses;
    private List<AllergyResponseDto> allergies;
}
