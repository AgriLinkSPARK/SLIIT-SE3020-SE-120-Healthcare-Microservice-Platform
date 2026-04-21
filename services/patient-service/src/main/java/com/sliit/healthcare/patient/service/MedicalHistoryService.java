package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.*;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Patient;
import com.sliit.healthcare.patient.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalHistoryService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicationRepository medicationRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AllergyRepository allergyRepository;
    private final DiagnosisRepository diagnosisRepository;

    @Transactional(readOnly = true)
    public MedicalHistoryResponseDto getMedicalHistory(String patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        log.info("Fetching complete medical history for patient: {}", patientId);

        // Count summaries
        long totalAppointments = appointmentRepository.count();
        long totalPrescriptions = prescriptionRepository.count();
        long totalMedications = medicationRepository.count();
        long totalRecords = medicalRecordRepository.count();

        // Fetch recent data (limit to 5 most recent)
        List<AppointmentResponseDto> recentAppointments = appointmentRepository
                .findByPatientIdOrderByAppointmentDateDesc(patientId).stream()
                .limit(5)
                .map(this::mapToAppointmentDto)
                .collect(Collectors.toList());

        List<PrescriptionResponseDto> recentPrescriptions = prescriptionRepository
                .findByPatientIdOrderByPrescriptionDateDesc(patientId).stream()
                .limit(5)
                .map(this::mapToPrescriptionDto)
                .collect(Collectors.toList());

        List<MedicationResponseDto> activeMedications = medicationRepository
                .findByPatientIdAndIsActive(patientId, true).stream()
                .map(this::mapToMedicationDto)
                .collect(Collectors.toList());

        List<MedicalRecordResponseDto> recentRecords = medicalRecordRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .limit(5)
                .map(this::mapToMedicalRecordDto)
                .collect(Collectors.toList());

        List<AllergyResponseDto> allergies = allergyRepository
                .findByPatientId(patientId).stream()
                .map(this::mapToAllergyDto)
                .collect(Collectors.toList());

        List<DiagnosisResponseDto> diagnoses = diagnosisRepository
                .findByPatientIdOrderByDiagnosedDateDesc(patientId).stream()
                .map(this::mapToDiagnosisDto)
                .collect(Collectors.toList());

        return MedicalHistoryResponseDto.builder()
                .patientId(patientId)
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .totalAppointments((int) totalAppointments)
                .totalPrescriptions((int) totalPrescriptions)
                .totalMedications((int) totalMedications)
                .totalRecords((int) totalRecords)
                .recentAppointments(recentAppointments)
                .recentPrescriptions(recentPrescriptions)
                .activeMedications(activeMedications)
                .recentRecords(recentRecords)
                .allergies(allergies)
                .diagnoses(diagnoses)
                .build();
    }

    // Mapper methods
    private AppointmentResponseDto mapToAppointmentDto(com.sliit.healthcare.patient.model.Appointment appointment) {
        return AppointmentResponseDto.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .doctorName(appointment.getDoctorName())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .reason(appointment.getReason())
                .status(appointment.getStatus())
                .createdAt(appointment.getCreatedAt())
                .build();
    }

    private PrescriptionResponseDto mapToPrescriptionDto(com.sliit.healthcare.patient.model.Prescription prescription) {
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

    private MedicationResponseDto mapToMedicationDto(com.sliit.healthcare.patient.model.Medication medication) {
        return MedicationResponseDto.builder()
                .id(medication.getId())
                .patientId(medication.getPatientId())
                .medicationName(medication.getMedicationName())
                .dosage(medication.getDosage())
                .frequency(medication.getFrequency())
                .sideEffects(medication.getSideEffects())
                .prescribedBy(medication.getPrescribedBy())
                .startDate(medication.getStartDate())
                .endDate(medication.getEndDate())
                .isActive(medication.getIsActive())
                .createdAt(medication.getCreatedAt())
                .build();
    }

    private MedicalRecordResponseDto mapToMedicalRecordDto(com.sliit.healthcare.patient.model.MedicalRecord record) {
        return MedicalRecordResponseDto.builder()
                .id(record.getId())
                .patientId(record.getPatientId())
                .recordType(record.getRecordType() != null ? record.getRecordType().name() : null)
                .title(record.getTitle())
                .description(record.getDescription())
                .fileUrl(record.getFileUrl())
                .recordDate(record.getRecordDate())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private AllergyResponseDto mapToAllergyDto(com.sliit.healthcare.patient.model.Allergy allergy) {
        return AllergyResponseDto.builder()
                .id(allergy.getId())
                .patientId(allergy.getPatientId())
                .allergyName(allergy.getAllergyName())
                .severity(allergy.getSeverity() != null ? allergy.getSeverity().name() : null)
                .reaction(allergy.getReaction())
                .notes(allergy.getNotes())
                .createdAt(allergy.getCreatedAt())
                .build();
    }

    private DiagnosisResponseDto mapToDiagnosisDto(com.sliit.healthcare.patient.model.Diagnosis diagnosis) {
        return DiagnosisResponseDto.builder()
                .id(diagnosis.getId())
                .patientId(diagnosis.getPatientId())
                .condition(diagnosis.getCondition())
                .plainLanguageDescription(diagnosis.getPlainLanguageDescription())
                .diagnosedDate(diagnosis.getDiagnosedDate())
                .status(diagnosis.getStatus() != null ? diagnosis.getStatus().name() : null)
                .createdAt(diagnosis.getCreatedAt())
                .build();
    }
}
