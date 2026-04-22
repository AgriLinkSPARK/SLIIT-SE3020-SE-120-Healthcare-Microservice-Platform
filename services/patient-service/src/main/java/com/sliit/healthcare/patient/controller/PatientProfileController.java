package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.MedicalReportRequestDto;
import com.sliit.healthcare.patient.dto.MedicalReportResponseDto;
import com.sliit.healthcare.patient.dto.PatientRequestDto;
import com.sliit.healthcare.patient.dto.PatientResponseDto;
import com.sliit.healthcare.patient.dto.CreatePatientFromAuthDto;
import com.sliit.healthcare.patient.service.PatientProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientProfileController {

    private final PatientProfileService patientProfileService;

    @Value("${app.file.storage.path:uploads/medical-reports}")
    private String storagePath;

    @GetMapping("/reports/download/{fileName}")
    public ResponseEntity<Resource> downloadReport(@PathVariable String fileName) {
        log.info("Downloading report file: {}", fileName);
        
        try {
            Path filePath = Paths.get(storagePath).resolve(fileName).normalize();
            File file = filePath.toFile();
            
            if (!file.exists()) {
                log.error("File not found: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(file);
            
            String contentType = determineContentType(fileName);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error downloading file: {}", fileName, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String fileName) {
        if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".doc")) {
            return "application/msword";
        } else if (fileName.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        return "application/octet-stream";
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<PatientResponseDto>> registerPatient(
            @RequestBody CreatePatientFromAuthDto requestDto) {
        log.info("Registering new patient from auth-service with userId: {}", requestDto.getUserId());
        PatientResponseDto createdPatient = patientProfileService.createPatientFromAuth(requestDto);
        return ResponseEntity.status(201).body(ApiResponse.success("Patient registered successfully", createdPatient));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponseDto>> getPatientById(@PathVariable String id) {
        log.info("Fetching patient: {}", id);
        PatientResponseDto patient = patientProfileService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PatientResponseDto>> getPatientByUserId(@PathVariable String userId) {
        log.info("Fetching patient by userId: {}", userId);
        PatientResponseDto patient = patientProfileService.getPatientByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponseDto>> updatePatient(
            @PathVariable String id,
            @Valid @RequestBody PatientRequestDto requestDto) {
        log.info("Updating patient: {}", id);
        PatientResponseDto updatedPatient = patientProfileService.updatePatient(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", updatedPatient));
    }

    @PostMapping("/{id}/upload-report")
    public ResponseEntity<ApiResponse<MedicalReportResponseDto>> uploadReport(
            @PathVariable String id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart("file") MultipartFile file) {
        log.info("Uploading report for patient: {}", id);
        MedicalReportRequestDto reportRequestDto = MedicalReportRequestDto.builder()
                .title(title)
                .description(description)
                .build();

        MedicalReportResponseDto response = patientProfileService.addMedicalReport(id, reportRequestDto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Medical report uploaded successfully", response));
    }

    @GetMapping("/{id}/reports")
    public ResponseEntity<ApiResponse<List<MedicalReportResponseDto>>> getReports(@PathVariable String id) {
        log.info("Fetching reports for patient: {}", id);
        List<MedicalReportResponseDto> reports = patientProfileService.getMedicalReports(id);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @DeleteMapping("/{id}/reports/{reportId}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable String id, @PathVariable String reportId) {
        log.info("Deleting report {} for patient: {}", reportId, id);
        patientProfileService.deleteMedicalReport(id, reportId);
        return ResponseEntity.ok(ApiResponse.success("Medical report deleted successfully", null));
    }
}
