package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.AllergyRequestDto;
import com.sliit.healthcare.patient.dto.AllergyResponseDto;
import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.service.AllergyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients/{patientId}/allergies")
@RequiredArgsConstructor
public class AllergyController {

    private final AllergyService allergyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AllergyResponseDto>>> getAllergiesByPatientId(@PathVariable String patientId) {
        log.info("Fetching allergies for patient: {}", patientId);
        List<AllergyResponseDto> allergies = allergyService.getAllergiesByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(allergies));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AllergyResponseDto>> addAllergy(
            @PathVariable String patientId,
            @Valid @RequestBody AllergyRequestDto requestDto) {
        log.info("Adding allergy for patient: {}", patientId);
        AllergyResponseDto allergy = allergyService.addAllergy(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Allergy added successfully", allergy));
    }

    @PutMapping("/{allergyId}")
    public ResponseEntity<ApiResponse<AllergyResponseDto>> updateAllergy(
            @PathVariable String allergyId,
            @Valid @RequestBody AllergyRequestDto requestDto) {
        log.info("Updating allergy: {}", allergyId);
        AllergyResponseDto allergy = allergyService.updateAllergy(allergyId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Allergy updated successfully", allergy));
    }

    @DeleteMapping("/{allergyId}")
    public ResponseEntity<ApiResponse<Void>> deleteAllergy(@PathVariable String allergyId) {
        log.info("Deleting allergy: {}", allergyId);
        allergyService.deleteAllergy(allergyId);
        return ResponseEntity.ok(ApiResponse.success("Allergy deleted successfully", null));
    }
}
