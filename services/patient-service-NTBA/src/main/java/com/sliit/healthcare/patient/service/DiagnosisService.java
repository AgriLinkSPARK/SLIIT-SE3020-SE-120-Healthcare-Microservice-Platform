package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.DiagnosisRequestDto;
import com.sliit.healthcare.patient.dto.DiagnosisResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Diagnosis;
import com.sliit.healthcare.patient.repository.DiagnosisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;

    @Transactional(readOnly = true)
    public List<DiagnosisResponseDto> getDiagnosesByPatientId(String patientId) {
        return diagnosisRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DiagnosisResponseDto addDiagnosis(String patientId, DiagnosisRequestDto requestDto) {
        Diagnosis diagnosis = Diagnosis.builder()
                .patientId(patientId)
                .condition(requestDto.getCondition())
                .plainLanguageDescription(requestDto.getPlainLanguageDescription())
                .diagnosedDate(requestDto.getDiagnosedDate())
                .status(requestDto.getStatus() != null ? Diagnosis.DiagnosisStatus.valueOf(requestDto.getStatus()) : Diagnosis.DiagnosisStatus.ACTIVE)
                .build();
        Diagnosis savedDiagnosis = diagnosisRepository.save(diagnosis);
        return mapToResponseDto(savedDiagnosis);
    }

    @Transactional
    public DiagnosisResponseDto updateDiagnosis(String diagnosisId, DiagnosisRequestDto requestDto) {
        Diagnosis diagnosis = diagnosisRepository.findById(diagnosisId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis", "id", diagnosisId));
        
        diagnosis.setCondition(requestDto.getCondition());
        diagnosis.setPlainLanguageDescription(requestDto.getPlainLanguageDescription());
        diagnosis.setDiagnosedDate(requestDto.getDiagnosedDate());
        if (requestDto.getStatus() != null) {
            diagnosis.setStatus(Diagnosis.DiagnosisStatus.valueOf(requestDto.getStatus()));
        }
        
        Diagnosis updatedDiagnosis = diagnosisRepository.save(diagnosis);
        return mapToResponseDto(updatedDiagnosis);
    }

    @Transactional
    public void deleteDiagnosis(String diagnosisId) {
        if (!diagnosisRepository.existsById(diagnosisId)) {
            throw new ResourceNotFoundException("Diagnosis", "id", diagnosisId);
        }
        diagnosisRepository.deleteById(diagnosisId);
    }

    private DiagnosisResponseDto mapToResponseDto(Diagnosis diagnosis) {
        return DiagnosisResponseDto.builder()
                .id(diagnosis.getId())
                .patientId(diagnosis.getPatientId())
                .condition(diagnosis.getCondition())
                .plainLanguageDescription(diagnosis.getPlainLanguageDescription())
                .diagnosedDate(diagnosis.getDiagnosedDate())
                .status(diagnosis.getStatus().name())
                .createdAt(diagnosis.getCreatedAt())
                .build();
    }
}
