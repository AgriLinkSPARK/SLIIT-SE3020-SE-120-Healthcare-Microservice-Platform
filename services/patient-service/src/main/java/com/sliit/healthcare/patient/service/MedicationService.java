package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.MedicationRequestDto;
import com.sliit.healthcare.patient.dto.MedicationResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Medication;
import com.sliit.healthcare.patient.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;

    @Transactional(readOnly = true)
    public List<MedicationResponseDto> getMedicationsByPatientId(String patientId) {
        return medicationRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationResponseDto> getActiveMedications(String patientId) {
        return medicationRepository.findByPatientIdAndIsActive(patientId, true).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicationResponseDto addMedication(String patientId, MedicationRequestDto requestDto) {
        Medication medication = Medication.builder()
                .patientId(patientId)
                .medicationName(requestDto.getMedicationName())
                .dosage(requestDto.getDosage())
                .frequency(requestDto.getFrequency())
                .sideEffects(requestDto.getSideEffects())
                .prescribedBy(requestDto.getPrescribedBy())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .isActive(requestDto.getIsActive() != null ? requestDto.getIsActive() : true)
                .build();
        Medication savedMedication = medicationRepository.save(medication);
        return mapToResponseDto(savedMedication);
    }

    @Transactional
    public MedicationResponseDto updateMedication(String medicationId, MedicationRequestDto requestDto) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", medicationId));
        
        medication.setMedicationName(requestDto.getMedicationName());
        medication.setDosage(requestDto.getDosage());
        medication.setFrequency(requestDto.getFrequency());
        medication.setSideEffects(requestDto.getSideEffects());
        medication.setPrescribedBy(requestDto.getPrescribedBy());
        medication.setStartDate(requestDto.getStartDate());
        medication.setEndDate(requestDto.getEndDate());
        medication.setIsActive(requestDto.getIsActive());
        
        Medication updatedMedication = medicationRepository.save(medication);
        return mapToResponseDto(updatedMedication);
    }

    @Transactional
    public void deactivateMedication(String medicationId) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", medicationId));
        medication.setIsActive(false);
        medicationRepository.save(medication);
    }

    @Transactional
    public void deleteMedication(String medicationId) {
        if (!medicationRepository.existsById(medicationId)) {
            throw new ResourceNotFoundException("Medication", "id", medicationId);
        }
        medicationRepository.deleteById(medicationId);
    }

    private MedicationResponseDto mapToResponseDto(Medication medication) {
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
}
