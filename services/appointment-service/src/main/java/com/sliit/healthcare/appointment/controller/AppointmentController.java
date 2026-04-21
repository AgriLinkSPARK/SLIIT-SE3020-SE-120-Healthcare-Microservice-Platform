package com.sliit.healthcare.appointment.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.healthcare.appointment.dto.AppointmentResponse;
import com.sliit.healthcare.appointment.dto.AppointmentStatusResponse;
import com.sliit.healthcare.appointment.dto.CreateAppointmentRequest;
import com.sliit.healthcare.appointment.dto.DoctorSearchResponse;
import com.sliit.healthcare.appointment.dto.UpdateAppointmentRequest;
import com.sliit.healthcare.appointment.model.Appointment.AppointmentStatus;
import com.sliit.healthcare.appointment.model.Appointment.AppointmentType;
import com.sliit.healthcare.appointment.service.AppointmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "appointment-service"));
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) AppointmentType type,
            @RequestParam(required = false) AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getAppointments(
                Optional.ofNullable(patientId),
                Optional.ofNullable(specialty),
                Optional.ofNullable(type),
                Optional.ofNullable(status)));
    }

    @GetMapping("/doctors/search")
    public ResponseEntity<List<DoctorSearchResponse>> searchDoctorsBySpecialty(
            @RequestParam(required = false) String specialty) {
        return ResponseEntity.ok(appointmentService.searchDoctorsBySpecialty(specialty));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AppointmentResponse>> searchAppointments(
            @RequestParam String specialty,
            @RequestParam(required = false) AppointmentType type) {
        return ResponseEntity.ok(appointmentService.searchAppointments(specialty, Optional.ofNullable(type)));
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentResponse created = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> getAppointment(@PathVariable String appointmentId) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(appointmentId));
    }

    @PutMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable String appointmentId,
            @Valid @RequestBody UpdateAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, request));
    }

    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(@PathVariable String appointmentId) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentId));
    }

    @PatchMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable String appointmentId,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(appointmentId, status));
    }

    @GetMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentStatusResponse> getStatus(@PathVariable String appointmentId) {
        return ResponseEntity.ok(appointmentService.getStatus(appointmentId));
    }
}
