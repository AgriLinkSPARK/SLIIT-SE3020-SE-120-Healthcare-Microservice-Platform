package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.AllergyRequestDto;
import com.sliit.healthcare.patient.dto.AllergyResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Allergy;
import com.sliit.healthcare.patient.repository.AllergyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllergyService {

    private final AllergyRepository allergyRepository;

    @Transactional(readOnly = true)
    public List<AllergyResponseDto> getAllergiesByPatientId(String patientId) {
        return allergyRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AllergyResponseDto addAllergy(String patientId, AllergyRequestDto requestDto) {
        Allergy allergy = Allergy.builder()
                .patientId(patientId)
                .allergyName(requestDto.getAllergyName())
                .severity(requestDto.getSeverity() != null ? Allergy.Severity.valueOf(requestDto.getSeverity()) : Allergy.Severity.MILD)
                .reaction(requestDto.getReaction())
                .notes(requestDto.getNotes())
                .build();
        Allergy savedAllergy = allergyRepository.save(allergy);
        return mapToResponseDto(savedAllergy);
    }

    @Transactional
    public AllergyResponseDto updateAllergy(String allergyId, AllergyRequestDto requestDto) {
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", allergyId));
        
        allergy.setAllergyName(requestDto.getAllergyName());
        if (requestDto.getSeverity() != null) {
            allergy.setSeverity(Allergy.Severity.valueOf(requestDto.getSeverity()));
        }
        allergy.setReaction(requestDto.getReaction());
        allergy.setNotes(requestDto.getNotes());
        
        Allergy updatedAllergy = allergyRepository.save(allergy);
        return mapToResponseDto(updatedAllergy);
    }

    @Transactional
    public void deleteAllergy(String allergyId) {
        if (!allergyRepository.existsById(allergyId)) {
            throw new ResourceNotFoundException("Allergy", "id", allergyId);
        }
        allergyRepository.deleteById(allergyId);
    }

    private AllergyResponseDto mapToResponseDto(Allergy allergy) {
        return AllergyResponseDto.builder()
                .id(allergy.getId())
                .patientId(allergy.getPatientId())
                .allergyName(allergy.getAllergyName())
                .severity(allergy.getSeverity().name())
                .reaction(allergy.getReaction())
                .notes(allergy.getNotes())
                .createdAt(allergy.getCreatedAt())
                .build();
    }
}
