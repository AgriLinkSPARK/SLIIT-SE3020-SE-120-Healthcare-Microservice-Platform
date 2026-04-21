package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.PrescriptionResponseDto;
import com.sliit.healthcare.patient.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients/{patientId}/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PrescriptionResponseDto>>> getPrescriptions(@PathVariable String patientId) {
        log.info("Fetching prescriptions for patient: {}", patientId);
        List<PrescriptionResponseDto> prescriptions = prescriptionService.getPrescriptionsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }

    @GetMapping("/{prescriptionId}")
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> getPrescription(
            @PathVariable String patientId,
            @PathVariable String prescriptionId) {
        log.info("Fetching prescription: {} for patient: {}", prescriptionId, patientId);
        PrescriptionResponseDto prescription = prescriptionService.getPrescriptionById(prescriptionId);
        return ResponseEntity.ok(ApiResponse.success(prescription));
    }

    @GetMapping("/by-appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<List<PrescriptionResponseDto>>> getPrescriptionsByAppointment(
            @PathVariable String patientId,
            @PathVariable String appointmentId) {
        log.info("Fetching prescriptions for appointment: {} and patient: {}", appointmentId, patientId);
        List<PrescriptionResponseDto> prescriptions = prescriptionService.getPrescriptionsByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }
}
