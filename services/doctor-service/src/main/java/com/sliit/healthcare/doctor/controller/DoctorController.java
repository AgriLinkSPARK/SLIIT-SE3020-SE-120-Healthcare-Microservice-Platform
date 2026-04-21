package com.sliit.healthcare.doctor.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.healthcare.doctor.dto.AppointmentDecisionRequest;
import com.sliit.healthcare.doctor.dto.AppointmentRequestCreateRequest;
import com.sliit.healthcare.doctor.dto.AvailabilityRequest;
import com.sliit.healthcare.doctor.dto.ConsultationCompleteRequest;
import com.sliit.healthcare.doctor.dto.ConsultationCreateRequest;
import com.sliit.healthcare.doctor.dto.DoctorCategoryResponse;
import com.sliit.healthcare.doctor.dto.DoctorProfileRequest;
import com.sliit.healthcare.doctor.dto.PrescriptionIssueRequest;
import com.sliit.healthcare.doctor.dto.PublicBookingDoctorResponse;
import com.sliit.healthcare.doctor.model.AppointmentRequest;
import com.sliit.healthcare.doctor.model.AvailabilitySlot;
import com.sliit.healthcare.doctor.model.ConsultationSession;
import com.sliit.healthcare.doctor.model.DigitalPrescription;
import com.sliit.healthcare.doctor.model.DoctorProfile;
import com.sliit.healthcare.doctor.model.PatientReport;
import com.sliit.healthcare.doctor.security.CurrentUser;
import com.sliit.healthcare.doctor.service.DoctorManagementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final DoctorManagementService doctorManagementService;

    public DoctorController(DoctorManagementService doctorManagementService) {
        this.doctorManagementService = doctorManagementService;
    }

    @GetMapping("/public/categories")
    public List<DoctorCategoryResponse> getDoctorCategories() {
        return doctorManagementService.getDoctorCategories();
    }

    @GetMapping("/public/booking-options")
    public List<PublicBookingDoctorResponse> getPublicBookingOptions(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String doctorName,
            @RequestParam(required = false) String date) {
        return doctorManagementService.getPublicBookingOptions(specialty, doctorName, date);
    }

    @PostMapping("/profile")
    public DoctorProfile upsertProfile(@AuthenticationPrincipal CurrentUser user,
            @Valid @RequestBody DoctorProfileRequest request) {
        return doctorManagementService.upsertProfile(user.userId(), request);
    }

    @GetMapping("/profile")
    public ResponseEntity<DoctorProfile> getProfile(@AuthenticationPrincipal CurrentUser user) {
        DoctorProfile profile = doctorManagementService.getProfile(user.userId());
        if (profile == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/availability")
    public AvailabilitySlot createAvailability(@AuthenticationPrincipal CurrentUser user,
            @Valid @RequestBody AvailabilityRequest request) {
        return doctorManagementService.createAvailability(user.userId(), request);
    }

    @GetMapping("/availability")
    public List<AvailabilitySlot> getAvailability(@AuthenticationPrincipal CurrentUser user) {
        return doctorManagementService.getAvailability(user.userId());
    }

    @PutMapping("/availability/{slotId}")
    public AvailabilitySlot updateAvailability(@AuthenticationPrincipal CurrentUser user,
            @PathVariable String slotId,
            @Valid @RequestBody AvailabilityRequest request) {
        return doctorManagementService.updateAvailability(user.userId(), slotId, request);
    }

    @DeleteMapping("/availability/{slotId}")
    public void deleteAvailability(@AuthenticationPrincipal CurrentUser user, @PathVariable String slotId) {
        doctorManagementService.deleteAvailability(user.userId(), slotId);
    }

    @PostMapping("/appointments/requests")
    public AppointmentRequest createAppointmentRequest(@AuthenticationPrincipal CurrentUser user,
            @Valid @RequestBody AppointmentRequestCreateRequest request) {
        return doctorManagementService.createAppointmentRequest(user.userId(), request);
    }

    @GetMapping("/appointments/requests")
    public List<AppointmentRequest> getAppointmentRequests(@AuthenticationPrincipal CurrentUser user) {
        return doctorManagementService.getAppointmentRequests(user.userId());
    }

    @PostMapping("/appointments/requests/{requestId}/accept")
    public AppointmentRequest acceptAppointmentRequest(@AuthenticationPrincipal CurrentUser user,
            @PathVariable String requestId) {
        return doctorManagementService.acceptAppointmentRequest(user.userId(), requestId);
    }

    @PostMapping("/appointments/requests/{requestId}/reject")
    public AppointmentRequest rejectAppointmentRequest(@AuthenticationPrincipal CurrentUser user,
            @PathVariable String requestId,
            @RequestBody(required = false) AppointmentDecisionRequest request) {
        return doctorManagementService.rejectAppointmentRequest(user.userId(), requestId, request);
    }

    @PostMapping("/consultations")
    public ConsultationSession createConsultation(@AuthenticationPrincipal CurrentUser user,
            @Valid @RequestBody ConsultationCreateRequest request) {
        return doctorManagementService.createConsultation(user.userId(), request);
    }

    @GetMapping("/consultations")
    public List<ConsultationSession> getConsultations(@AuthenticationPrincipal CurrentUser user) {
        return doctorManagementService.getConsultations(user.userId());
    }

    @PostMapping("/consultations/{consultationId}/start")
    public ConsultationSession startConsultation(@AuthenticationPrincipal CurrentUser user,
            @PathVariable String consultationId) {
        return doctorManagementService.startConsultation(user.userId(), consultationId);
    }

    @PostMapping("/consultations/{consultationId}/complete")
    public ConsultationSession completeConsultation(@AuthenticationPrincipal CurrentUser user,
            @PathVariable String consultationId,
            @RequestBody(required = false) ConsultationCompleteRequest request) {
        return doctorManagementService.completeConsultation(user.userId(), consultationId, request);
    }

    @PostMapping("/prescriptions")
    public DigitalPrescription issuePrescription(@AuthenticationPrincipal CurrentUser user,
            @Valid @RequestBody PrescriptionIssueRequest request) {
        return doctorManagementService.issuePrescription(user.userId(), request);
    }

    @GetMapping("/prescriptions")
    public List<DigitalPrescription> getPrescriptions(@AuthenticationPrincipal CurrentUser user,
            @RequestParam(required = false) String patientId) {
        return doctorManagementService.getPrescriptions(user.userId(), patientId);
    }

    @GetMapping("/patient-reports/{patientId}")
    public List<PatientReport> getPatientReports(@PathVariable String patientId) {
        return doctorManagementService.getPatientReports(patientId);
    }
}
