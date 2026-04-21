package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.MedicalRecordRequestDto;
import com.sliit.healthcare.patient.dto.MedicalRecordResponseDto;
import com.sliit.healthcare.patient.dto.MedicalReportRequestDto;
import com.sliit.healthcare.patient.dto.MedicalReportResponseDto;
import com.sliit.healthcare.patient.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicalRecordResponseDto>>> getRecordsByPatientId(@PathVariable String patientId) {
        List<MedicalRecordResponseDto> records = medicalRecordService.getRecordsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalRecordResponseDto>> uploadRecord(
            @PathVariable String patientId,
            @Valid @RequestBody MedicalRecordRequestDto requestDto) {
        MedicalRecordResponseDto record = medicalRecordService.uploadRecord(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Record uploaded successfully", record));
    }

    @PostMapping("/{recordId}/reports")
    public ResponseEntity<ApiResponse<MedicalReportResponseDto>> addMedicalReport(
            @PathVariable String patientId,
            @PathVariable String recordId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart("file") MultipartFile file) {
        MedicalReportRequestDto reportRequestDto = MedicalReportRequestDto.builder()
                .title(title)
                .description(description)
                .build();

        MedicalReportResponseDto response = medicalRecordService.addMedicalReport(patientId, recordId, reportRequestDto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Medical report uploaded successfully", response));
    }

    @GetMapping("/{recordId}/reports")
    public ResponseEntity<ApiResponse<List<MedicalReportResponseDto>>> getMedicalReports(
            @PathVariable String patientId,
            @PathVariable String recordId) {
        List<MedicalReportResponseDto> reports = medicalRecordService.getMedicalReports(patientId, recordId);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @DeleteMapping("/{recordId}/reports/{reportId}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalReport(
            @PathVariable String patientId,
            @PathVariable String recordId,
            @PathVariable String reportId) {
        medicalRecordService.deleteMedicalReport(patientId, recordId, reportId);
        return ResponseEntity.ok(ApiResponse.success("Medical report deleted successfully", null));
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(@PathVariable String recordId) {
        medicalRecordService.deleteRecord(recordId);
        return ResponseEntity.ok(ApiResponse.success("Record deleted successfully", null));
    }
}
