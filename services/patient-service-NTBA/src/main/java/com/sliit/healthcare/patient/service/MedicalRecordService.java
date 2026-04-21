package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.MedicalRecordRequestDto;
import com.sliit.healthcare.patient.dto.MedicalRecordResponseDto;
import com.sliit.healthcare.patient.dto.MedicalReportRequestDto;
import com.sliit.healthcare.patient.dto.MedicalReportResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.MedicalRecord;
import com.sliit.healthcare.patient.model.MedicalReport;
import com.sliit.healthcare.patient.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDto> getRecordsByPatientId(String patientId) {
        return medicalRecordRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicalRecordResponseDto uploadRecord(String patientId, MedicalRecordRequestDto requestDto) {
        MedicalRecord record = MedicalRecord.builder()
                .patientId(patientId)
                .recordType(MedicalRecord.RecordType.valueOf(requestDto.getRecordType()))
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .fileUrl(requestDto.getFileUrl())
                .recordDate(requestDto.getRecordDate())
                .build();
        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        return mapToResponseDto(savedRecord);
    }

    @Transactional
    public MedicalReportResponseDto addMedicalReport(String patientId, String recordId, MedicalReportRequestDto reportRequestDto, MultipartFile file) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", recordId));

        if (!record.getPatientId().equals(patientId)) {
            throw new ResourceNotFoundException("MedicalRecord", "patientId", patientId);
        }

        String fileUrl = fileStorageService.saveFile(file);

        MedicalReport report = MedicalReport.builder()
                .id(UUID.randomUUID().toString())
                .title(reportRequestDto.getTitle())
                .description(reportRequestDto.getDescription())
                .fileUrl(fileUrl)
                .build();

        if (record.getReports() == null) {
            record.setReports(new java.util.ArrayList<>());
        }
        record.getReports().add(report);
        medicalRecordRepository.save(record);

        return mapToReportResponseDto(report);
    }

    @Transactional(readOnly = true)
    public java.util.List<MedicalReportResponseDto> getMedicalReports(String patientId, String recordId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", recordId));

        if (!record.getPatientId().equals(patientId)) {
            throw new ResourceNotFoundException("MedicalRecord", "patientId", patientId);
        }

        if (record.getReports() == null) {
            return java.util.Collections.emptyList();
        }

        return record.getReports().stream()
                .map(this::mapToReportResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMedicalReport(String patientId, String recordId, String reportId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", recordId));

        if (!record.getPatientId().equals(patientId)) {
            throw new ResourceNotFoundException("MedicalRecord", "patientId", patientId);
        }

        MedicalReport report = record.getReports().stream()
                .filter(r -> r.getId().equals(reportId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        if (report.getFileUrl() != null) {
            fileStorageService.deleteFile(report.getFileUrl());
        }

        record.getReports().remove(report);
        medicalRecordRepository.save(record);
    }

    @Transactional
    public void deleteRecord(String recordId) {
        if (!medicalRecordRepository.existsById(recordId)) {
            throw new ResourceNotFoundException("Medical Record", "id", recordId);
        }
        medicalRecordRepository.deleteById(recordId);
    }

    private MedicalRecordResponseDto mapToResponseDto(MedicalRecord record) {
        return MedicalRecordResponseDto.builder()
                .id(record.getId())
                .patientId(String.valueOf(record.getPatientId()))
                .recordType(record.getRecordType().name())
                .title(record.getTitle())
                .description(record.getDescription())
                .fileUrl(record.getFileUrl())
                .recordDate(record.getRecordDate())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private MedicalReportResponseDto mapToReportResponseDto(MedicalReport report) {
        return MedicalReportResponseDto.builder()
                .id(report.getId())
                .title(report.getTitle())
                .description(report.getDescription())
                .fileUrl(report.getFileUrl())
                .build();
    }
}
