package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.DiagnosisRequestDto;
import com.sliit.healthcare.patient.dto.DiagnosisResponseDto;
import com.sliit.healthcare.patient.service.DiagnosisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients/{patientId}/diagnoses")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DiagnosisResponseDto>>> getDiagnosesByPatientId(@PathVariable String patientId) {
        log.info("Fetching diagnoses for patient: {}", patientId);
        List<DiagnosisResponseDto> diagnoses = diagnosisService.getDiagnosesByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(diagnoses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DiagnosisResponseDto>> addDiagnosis(
            @PathVariable String patientId,
            @Valid @RequestBody DiagnosisRequestDto requestDto) {
        log.info("Adding diagnosis for patient: {}", patientId);
        DiagnosisResponseDto diagnosis = diagnosisService.addDiagnosis(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Diagnosis added successfully", diagnosis));
    }

    @PutMapping("/{diagnosisId}")
    public ResponseEntity<ApiResponse<DiagnosisResponseDto>> updateDiagnosis(
            @PathVariable String diagnosisId,
            @Valid @RequestBody DiagnosisRequestDto requestDto) {
        log.info("Updating diagnosis: {}", diagnosisId);
        DiagnosisResponseDto diagnosis = diagnosisService.updateDiagnosis(diagnosisId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Diagnosis updated successfully", diagnosis));
    }

    @DeleteMapping("/{diagnosisId}")
    public ResponseEntity<ApiResponse<Void>> deleteDiagnosis(@PathVariable String diagnosisId) {
        log.info("Deleting diagnosis: {}", diagnosisId);
        diagnosisService.deleteDiagnosis(diagnosisId);
        return ResponseEntity.ok(ApiResponse.success("Diagnosis deleted successfully", null));
    }
}
