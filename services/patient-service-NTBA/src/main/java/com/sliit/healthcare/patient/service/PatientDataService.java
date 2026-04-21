package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.PatientDataRequestDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.PatientGeneratedData;
import com.sliit.healthcare.patient.repository.PatientGeneratedDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientDataService {

    private final PatientGeneratedDataRepository patientGeneratedDataRepository;

    @Transactional
    public PatientGeneratedData logSymptom(String patientId, PatientDataRequestDto requestDto) {
        PatientGeneratedData data = PatientGeneratedData.builder()
                .patientId(patientId)
                .dataType(PatientGeneratedData.DataType.SYMPTOM)
                .dataValue(requestDto.getValue())
                .unit(requestDto.getUnit())
                .notes(requestDto.getNotes())
                .build();
        return patientGeneratedDataRepository.save(data);
    }

    @Transactional
    public PatientGeneratedData uploadReport(String patientId, PatientDataRequestDto requestDto) {
        PatientGeneratedData data = PatientGeneratedData.builder()
                .patientId(patientId)
                .dataType(PatientGeneratedData.DataType.REPORT)
                .dataValue(requestDto.getValue())
                .unit(requestDto.getUnit())
                .notes(requestDto.getNotes())
                .build();
        return patientGeneratedDataRepository.save(data);
    }

    @Transactional(readOnly = true)
    public List<PatientGeneratedData> getHistory(String patientId, String type) {
        if (type == null || type.isEmpty()) {
            return patientGeneratedDataRepository.findByPatientId(patientId);
        }
        try {
            PatientGeneratedData.DataType dataType = PatientGeneratedData.DataType.valueOf(type.toUpperCase());
            return patientGeneratedDataRepository.findByPatientIdAndDataType(patientId, dataType);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Data type not found: " + type);
        }
    }
}
