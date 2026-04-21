package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.AppointmentRequestDto;
import com.sliit.healthcare.patient.dto.AppointmentResponseDto;
import com.sliit.healthcare.patient.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients/{patientId}/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponseDto>>> getAppointments(@PathVariable String patientId) {
        List<AppointmentResponseDto> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDto>>> getUpcomingAppointments(@PathVariable String patientId) {
        List<AppointmentResponseDto> appointments = appointmentService.getUpcomingAppointments(patientId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> getAppointment(
            @PathVariable String patientId,
            @PathVariable String appointmentId) {
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> bookAppointment(
            @PathVariable String patientId,
            @Valid @RequestBody AppointmentRequestDto requestDto) {
        log.info("Booking appointment for patient: {}", patientId);
        AppointmentResponseDto appointment = appointmentService.bookAppointment(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Appointment booked successfully", appointment));
    }

    @PutMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> updateAppointment(
            @PathVariable String patientId,
            @PathVariable String appointmentId,
            @Valid @RequestBody AppointmentRequestDto requestDto) {
        log.info("Updating appointment: {} for patient: {}", appointmentId, patientId);
        AppointmentResponseDto appointment = appointmentService.updateAppointment(appointmentId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", appointment));
    }

    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(
            @PathVariable String patientId,
            @PathVariable String appointmentId) {
        log.info("Cancelling appointment: {} for patient: {}", appointmentId, patientId);
        appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", null));
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(
            @PathVariable String patientId,
            @PathVariable String appointmentId) {
        log.info("Deleting appointment: {} for patient: {}", appointmentId, patientId);
        appointmentService.deleteAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", null));
    }
}
