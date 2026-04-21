package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.ImmunizationRequestDto;
import com.sliit.healthcare.patient.dto.ImmunizationResponseDto;
import com.sliit.healthcare.patient.service.ImmunizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/immunizations")
@RequiredArgsConstructor
public class ImmunizationController {

    private final ImmunizationService immunizationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImmunizationResponseDto>>> getImmunizationsByPatientId(@PathVariable String patientId) {
        List<ImmunizationResponseDto> immunizations = immunizationService.getImmunizationsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(immunizations));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ImmunizationResponseDto>> addImmunization(
            @PathVariable String patientId,
            @Valid @RequestBody ImmunizationRequestDto requestDto) {
        ImmunizationResponseDto immunization = immunizationService.addImmunization(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Immunization added successfully", immunization));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<ImmunizationResponseDto>>> getUpcomingImmunizations(@PathVariable String patientId) {
        List<ImmunizationResponseDto> immunizations = immunizationService.getUpcomingImmunizations(patientId);
        return ResponseEntity.ok(ApiResponse.success(immunizations));
    }
}
