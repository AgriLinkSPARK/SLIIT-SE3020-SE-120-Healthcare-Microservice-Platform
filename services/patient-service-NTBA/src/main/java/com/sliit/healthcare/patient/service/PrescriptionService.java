package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.PrescriptionResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Prescription;
import com.sliit.healthcare.patient.repository.PatientRepository;
import com.sliit.healthcare.patient.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getPrescriptionsByPatientId(String patientId) {
        validatePatientExists(patientId);
        log.info("Fetching prescriptions for patient: {}", patientId);
        return prescriptionRepository.findByPatientIdOrderByPrescriptionDateDesc(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrescriptionResponseDto getPrescriptionById(String prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", prescriptionId));
        return mapToResponseDto(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getPrescriptionsByAppointmentId(String appointmentId) {
        log.info("Fetching prescriptions for appointment: {}", appointmentId);
        return prescriptionRepository.findByAppointmentId(appointmentId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private void validatePatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", "id", patientId);
        }
    }

    private PrescriptionResponseDto mapToResponseDto(Prescription prescription) {
        return PrescriptionResponseDto.builder()
                .id(prescription.getId())
                .patientId(prescription.getPatientId())
                .doctorId(prescription.getDoctorId())
                .doctorName(prescription.getDoctorName())
                .appointmentId(prescription.getAppointmentId())
                .diagnosis(prescription.getDiagnosis())
                .notes(prescription.getNotes())
                .prescriptionDate(prescription.getPrescriptionDate())
                .validUntil(prescription.getValidUntil())
                .medications(prescription.getMedications().stream()
                        .map(med -> PrescriptionResponseDto.PrescribedMedicationDto.builder()
                                .medicationName(med.getMedicationName())
                                .dosage(med.getDosage())
                                .frequency(med.getFrequency())
                                .duration(med.getDuration())
                                .instructions(med.getInstructions())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(prescription.getCreatedAt())
                .build();
    }
}
