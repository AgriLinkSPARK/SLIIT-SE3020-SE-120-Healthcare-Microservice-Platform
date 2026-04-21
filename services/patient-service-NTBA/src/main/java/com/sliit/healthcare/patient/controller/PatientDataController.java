package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.PatientDataRequestDto;
import com.sliit.healthcare.patient.model.PatientGeneratedData;
import com.sliit.healthcare.patient.service.PatientDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/data")
@RequiredArgsConstructor
public class PatientDataController {

    private final PatientDataService patientDataService;

    @PostMapping
    public ResponseEntity<ApiResponse<PatientGeneratedData>> logData(
            @PathVariable String patientId,
            @Valid @RequestBody PatientDataRequestDto requestDto) {
        PatientGeneratedData data;
        if ("SYMPTOM".equalsIgnoreCase(requestDto.getDataType())) {
            data = patientDataService.logSymptom(patientId, requestDto);
        } else {
            data = patientDataService.uploadReport(patientId, requestDto);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Data logged successfully", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientGeneratedData>>> getHistory(
            @PathVariable String patientId,
            @RequestParam(required = false) String type) {
        List<PatientGeneratedData> history = patientDataService.getHistory(patientId, type);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
