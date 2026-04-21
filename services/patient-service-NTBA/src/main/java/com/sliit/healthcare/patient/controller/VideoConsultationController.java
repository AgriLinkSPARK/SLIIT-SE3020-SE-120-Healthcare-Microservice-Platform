package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.VideoConsultationResponseDto;
import com.sliit.healthcare.patient.service.VideoConsultationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients/{patientId}/consultations")
@RequiredArgsConstructor
public class VideoConsultationController {

    private final VideoConsultationService videoConsultationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoConsultationResponseDto>>> getConsultations(@PathVariable String patientId) {
        log.info("Fetching video consultations for patient: {}", patientId);
        List<VideoConsultationResponseDto> consultations = videoConsultationService.getConsultationsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(consultations));
    }

    @GetMapping("/{consultationId}")
    public ResponseEntity<ApiResponse<VideoConsultationResponseDto>> getConsultation(
            @PathVariable String patientId,
            @PathVariable String consultationId) {
        log.info("Fetching consultation: {} for patient: {}", consultationId, patientId);
        VideoConsultationResponseDto consultation = videoConsultationService.getConsultationById(consultationId);
        return ResponseEntity.ok(ApiResponse.success(consultation));
    }

    @GetMapping("/by-appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<VideoConsultationResponseDto>> getConsultationByAppointment(
            @PathVariable String patientId,
            @PathVariable String appointmentId) {
        log.info("Fetching consultation for appointment: {} and patient: {}", appointmentId, patientId);
        VideoConsultationResponseDto consultation = videoConsultationService.getConsultationByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(consultation));
    }

    @PostMapping("/by-appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<VideoConsultationResponseDto>> createConsultation(
            @PathVariable String patientId,
            @PathVariable String appointmentId) {
        log.info("Creating video consultation for appointment: {} and patient: {}", appointmentId, patientId);
        VideoConsultationResponseDto consultation = videoConsultationService.createConsultation(appointmentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Video consultation created successfully", consultation));
    }

    @PostMapping("/{consultationId}/start")
    public ResponseEntity<ApiResponse<VideoConsultationResponseDto>> startConsultation(
            @PathVariable String patientId,
            @PathVariable String consultationId) {
        log.info("Starting consultation: {} for patient: {}", consultationId, patientId);
        VideoConsultationResponseDto consultation = videoConsultationService.startConsultation(consultationId);
        return ResponseEntity.ok(ApiResponse.success("Consultation started successfully", consultation));
    }

    @PostMapping("/{consultationId}/end")
    public ResponseEntity<ApiResponse<VideoConsultationResponseDto>> endConsultation(
            @PathVariable String patientId,
            @PathVariable String consultationId) {
        log.info("Ending consultation: {} for patient: {}", consultationId, patientId);
        VideoConsultationResponseDto consultation = videoConsultationService.endConsultation(consultationId);
        return ResponseEntity.ok(ApiResponse.success("Consultation ended successfully", consultation));
    }

    @PostMapping("/{consultationId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelConsultation(
            @PathVariable String patientId,
            @PathVariable String consultationId) {
        log.info("Cancelling consultation: {} for patient: {}", consultationId, patientId);
        videoConsultationService.cancelConsultation(consultationId);
        return ResponseEntity.ok(ApiResponse.success("Consultation cancelled successfully", null));
    }
}
