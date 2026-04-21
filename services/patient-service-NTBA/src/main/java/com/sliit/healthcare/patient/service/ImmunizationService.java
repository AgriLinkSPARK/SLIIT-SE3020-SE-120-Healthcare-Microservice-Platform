package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.ImmunizationRequestDto;
import com.sliit.healthcare.patient.dto.ImmunizationResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Immunization;
import com.sliit.healthcare.patient.repository.ImmunizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImmunizationService {

    private final ImmunizationRepository immunizationRepository;

    @Transactional(readOnly = true)
    public List<ImmunizationResponseDto> getImmunizationsByPatientId(String patientId) {
        return immunizationRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ImmunizationResponseDto> getUpcomingImmunizations(String patientId) {
        return immunizationRepository.findByPatientIdAndNextDueDateAfter(patientId, LocalDate.now()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ImmunizationResponseDto addImmunization(String patientId, ImmunizationRequestDto requestDto) {
        Immunization immunization = Immunization.builder()
                .patientId(patientId)
                .vaccineName(requestDto.getVaccineName())
                .administeredDate(requestDto.getAdministeredDate())
                .nextDueDate(requestDto.getNextDueDate())
                .administeredBy(requestDto.getAdministeredBy())
                .batchNumber(requestDto.getBatchNumber())
                .build();
        Immunization savedImmunization = immunizationRepository.save(immunization);
        return mapToResponseDto(savedImmunization);
    }

    @Transactional
    public ImmunizationResponseDto updateImmunization(String immunizationId, ImmunizationRequestDto requestDto) {
        Immunization immunization = immunizationRepository.findById(immunizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Immunization", "id", immunizationId));
        
        immunization.setVaccineName(requestDto.getVaccineName());
        immunization.setAdministeredDate(requestDto.getAdministeredDate());
        immunization.setNextDueDate(requestDto.getNextDueDate());
        immunization.setAdministeredBy(requestDto.getAdministeredBy());
        immunization.setBatchNumber(requestDto.getBatchNumber());
        
        Immunization updatedImmunization = immunizationRepository.save(immunization);
        return mapToResponseDto(updatedImmunization);
    }

    @Transactional
    public void deleteImmunization(String immunizationId) {
        if (!immunizationRepository.existsById(immunizationId)) {
            throw new ResourceNotFoundException("Immunization", "id", immunizationId);
        }
        immunizationRepository.deleteById(immunizationId);
    }

    private ImmunizationResponseDto mapToResponseDto(Immunization immunization) {
        return ImmunizationResponseDto.builder()
                .id(immunization.getId())
                .patientId(immunization.getPatientId())
                .vaccineName(immunization.getVaccineName())
                .administeredDate(immunization.getAdministeredDate())
                .nextDueDate(immunization.getNextDueDate())
                .administeredBy(immunization.getAdministeredBy())
                .batchNumber(immunization.getBatchNumber())
                .createdAt(immunization.getCreatedAt())
                .build();
    }
}
