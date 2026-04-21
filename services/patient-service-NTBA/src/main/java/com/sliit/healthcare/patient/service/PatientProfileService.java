package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.MedicalReportRequestDto;
import com.sliit.healthcare.patient.dto.MedicalReportResponseDto;
import com.sliit.healthcare.patient.dto.PatientRequestDto;
import com.sliit.healthcare.patient.dto.PatientResponseDto;
import com.sliit.healthcare.patient.dto.CreatePatientFromAuthDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.MedicalReport;
import com.sliit.healthcare.patient.model.Patient;
import com.sliit.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    private Patient findPatientByIdOrUserId(String id) {
        return patientRepository.findByUserId(id)
                .orElseGet(() -> patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id)));
    }

    @Transactional(readOnly = true)
    public PatientResponseDto getPatientById(String id) {
        Patient patient = findPatientByIdOrUserId(id);
        return mapToResponseDto(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponseDto getPatientByUserId(String userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));
        return mapToResponseDto(patient);
    }

    @Transactional
    public PatientResponseDto createPatient(PatientRequestDto requestDto) {
        Patient patient = Patient.builder()
                .firstName(requestDto.getFirstName())
                .lastName(requestDto.getLastName())
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .phone(requestDto.getPhone())
                .dateOfBirth(requestDto.getDateOfBirth())
                .gender(requestDto.getGender())
                .address(requestDto.getAddress())
                .build();
        Patient savedPatient = patientRepository.save(patient);
        return mapToResponseDto(savedPatient);
    }

    @Transactional
    public PatientResponseDto createPatientFromAuth(CreatePatientFromAuthDto dto) {
        if (patientRepository.existsByUserId(dto.getUserId())) {
            return patientRepository.findByUserId(dto.getUserId())
                   .map(this::mapToResponseDto)
                   .orElseThrow();
        }

        String fn = dto.getFullName() != null ? dto.getFullName().trim() : "";
        String[] nameParts = fn.split(" ", 2);
        String firstName = nameParts.length > 0 ? nameParts[0] : "";
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        LocalDate parsedDate = null;
        if (dto.getDateOfBirth() != null && !dto.getDateOfBirth().trim().isEmpty()) {
            try {
                parsedDate = LocalDate.parse(dto.getDateOfBirth());
            } catch (Exception e) {
                // Ignore parse failure
            }
        }

        Patient patient = Patient.builder()
                .userId(dto.getUserId())
                .firstName(firstName)
                .lastName(lastName)
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .dateOfBirth(parsedDate)
                .gender(dto.getGender())
                .address(dto.getAddress())
                .build();

        Patient savedPatient = patientRepository.save(patient);
        return mapToResponseDto(savedPatient);
    }

    @Transactional
    public PatientResponseDto updatePatient(String id, PatientRequestDto requestDto) {
        Patient patient = findPatientByIdOrUserId(id);
        
        patient.setFirstName(requestDto.getFirstName());
        patient.setLastName(requestDto.getLastName());
        patient.setEmail(requestDto.getEmail());
        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            patient.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }
        patient.setPhone(requestDto.getPhone());
        patient.setDateOfBirth(requestDto.getDateOfBirth());
        patient.setGender(requestDto.getGender());
        patient.setAddress(requestDto.getAddress());
        
        Patient updatedPatient = patientRepository.save(patient);
        return mapToResponseDto(updatedPatient);
    }

    @Transactional
    public MedicalReportResponseDto addMedicalReport(String patientId, MedicalReportRequestDto reportRequestDto, MultipartFile file) {
        Patient patient = findPatientByIdOrUserId(patientId);

        String fileUrl = fileStorageService.saveFile(file);

        MedicalReport report = MedicalReport.builder()
                .id(UUID.randomUUID().toString())
                .title(reportRequestDto.getTitle())
                .description(reportRequestDto.getDescription())
                .fileUrl(fileUrl)
                .build();

        if (patient.getReports() == null) {
            patient.setReports(new java.util.ArrayList<>());
        }
        patient.getReports().add(report);
        patientRepository.save(patient);

        return mapToReportResponseDto(report);
    }

    @Transactional(readOnly = true)
    public List<MedicalReportResponseDto> getMedicalReports(String patientId) {
        Patient patient = findPatientByIdOrUserId(patientId);

        if (patient.getReports() == null) {
            return java.util.Collections.emptyList();
        }

        return patient.getReports().stream()
                .map(this::mapToReportResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMedicalReport(String patientId, String reportId) {
        Patient patient = findPatientByIdOrUserId(patientId);

        if (patient.getReports() == null) {
            throw new ResourceNotFoundException("MedicalReport", "id", reportId);
        }

        MedicalReport report = patient.getReports().stream()
                .filter(r -> r.getId().equals(reportId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));

        if (report.getFileUrl() != null) {
            fileStorageService.deleteFile(report.getFileUrl());
        }

        patient.getReports().remove(report);
        patientRepository.save(patient);
    }

    private PatientResponseDto mapToResponseDto(Patient patient) {
        return PatientResponseDto.builder()
                .id(patient.getId())
                .userId(patient.getUserId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .email(patient.getEmail())
                .phone(patient.getPhone())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
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
