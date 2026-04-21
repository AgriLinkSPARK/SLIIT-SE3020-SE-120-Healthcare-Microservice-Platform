package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.InsuranceInfoRequestDto;
import com.sliit.healthcare.patient.model.InsuranceInfo;
import com.sliit.healthcare.patient.service.InsuranceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/insurance")
@RequiredArgsConstructor
public class InsuranceController {

    private final InsuranceService insuranceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InsuranceInfo>>> getInsurance(@PathVariable String patientId) {
        List<InsuranceInfo> insurance = insuranceService.getInsurance(patientId);
        return ResponseEntity.ok(ApiResponse.success(insurance));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InsuranceInfo>> addInsurance(
            @PathVariable String patientId,
            @Valid @RequestBody InsuranceInfoRequestDto requestDto) {
        InsuranceInfo insurance = insuranceService.addInsurance(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Insurance added successfully", insurance));
    }

    @PutMapping("/{insuranceId}")
    public ResponseEntity<ApiResponse<InsuranceInfo>> updateInsurance(
            @PathVariable String insuranceId,
            @Valid @RequestBody InsuranceInfoRequestDto requestDto) {
        InsuranceInfo insurance = insuranceService.updateInsurance(insuranceId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Insurance updated successfully", insurance));
    }
}
