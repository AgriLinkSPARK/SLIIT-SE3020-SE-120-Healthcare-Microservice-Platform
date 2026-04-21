package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.MedicationRequestDto;
import com.sliit.healthcare.patient.dto.MedicationResponseDto;
import com.sliit.healthcare.patient.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicationResponseDto>>> getMedicationsByPatientId(@PathVariable String patientId) {
        List<MedicationResponseDto> medications = medicationService.getMedicationsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(medications));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicationResponseDto>> addMedication(
            @PathVariable String patientId,
            @Valid @RequestBody MedicationRequestDto requestDto) {
        MedicationResponseDto medication = medicationService.addMedication(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Medication added successfully", medication));
    }

    @PutMapping("/{medicationId}")
    public ResponseEntity<ApiResponse<MedicationResponseDto>> updateMedication(
            @PathVariable String medicationId,
            @Valid @RequestBody MedicationRequestDto requestDto) {
        MedicationResponseDto medication = medicationService.updateMedication(medicationId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Medication updated successfully", medication));
    }

    @DeleteMapping("/{medicationId}")
    public ResponseEntity<ApiResponse<Void>> deleteMedication(@PathVariable String medicationId) {
        medicationService.deleteMedication(medicationId);
        return ResponseEntity.ok(ApiResponse.success("Medication deleted successfully", null));
    }
}
