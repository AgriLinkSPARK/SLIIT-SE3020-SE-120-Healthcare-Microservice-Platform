package com.sliit.healthcare.telemedicine.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.healthcare.telemedicine.dto.CreateVideoSessionRequest;
import com.sliit.healthcare.telemedicine.dto.VideoSessionResponse;
import com.sliit.healthcare.telemedicine.service.VideoSessionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/telemedicine/sessions")
public class VideoSessionController {

    private static final Logger log = LoggerFactory.getLogger(VideoSessionController.class);
    
    private final VideoSessionService videoSessionService;
    
    public VideoSessionController(VideoSessionService videoSessionService) {
        this.videoSessionService = videoSessionService;
    }
    
    /**
     * Creates a new video session (appointment booking)
     * Roles: DOCTOR, ADMIN
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VideoSessionResponse createSession(
        @Valid @RequestBody CreateVideoSessionRequest request,
        Authentication authentication) {
        log.info("Creating new video session for appointment: {}", request.getAppointmentId());
        return videoSessionService.createVideoSession(request, authentication);
    }
    
    /**
     * Gets a specific video session
     * Roles: PATIENT, DOCTOR
     */
    @GetMapping("/{sessionId}")
    public VideoSessionResponse getSession(@PathVariable String sessionId, Authentication authentication) {
        log.info("Fetching video session: {}", sessionId);
        return videoSessionService.getVideoSession(sessionId, authentication);
    }

    /**
     * Gets a specific video session by appointment ID
     * Roles: PATIENT, DOCTOR
     */
    @GetMapping("/appointment/{appointmentId}")
    public VideoSessionResponse getSessionByAppointment(
        @PathVariable String appointmentId,
        Authentication authentication) {
        log.info("Fetching video session for appointment: {}", appointmentId);
        return videoSessionService.getVideoSessionByAppointmentId(appointmentId, authentication);
    }
    
    /**
     * Starts a video session and returns Jitsi Meet URL
     * Called when user joins the conference
     * Roles: PATIENT, DOCTOR
     */
    @PostMapping("/{sessionId}/start")
    public ResponseEntity<String> startSession(
        @PathVariable String sessionId,
        @RequestParam String userDisplayName,
        @RequestParam String userEmail,
        Authentication authentication) {
        log.info("Starting video session: {}, user: {}", sessionId, userDisplayName);
        String jitsiMeetUrl = videoSessionService.startVideoSession(
            sessionId,
            authentication,
            userDisplayName,
            userEmail
        );
        
        return ResponseEntity.ok(jitsiMeetUrl);
    }
    
    /**
     * Ends a video session
     * Roles: DOCTOR (moderator can end session)
     */
    @PostMapping("/{sessionId}/end")
    public VideoSessionResponse endSession(@PathVariable String sessionId, Authentication authentication) {
        log.info("Ending video session: {}", sessionId);
        return videoSessionService.endVideoSession(sessionId, authentication);
    }
    
    /**
     * Cancels a video session before it starts
     * Roles: DOCTOR, ADMIN
     */
    @PutMapping("/{sessionId}/cancel")
    public VideoSessionResponse cancelSession(
        @PathVariable String sessionId,
        @RequestParam(required = false, defaultValue = "No reason provided") String reason,
        Authentication authentication) {
        log.info("Cancelling video session: {}", sessionId);
        return videoSessionService.cancelVideoSession(sessionId, reason, authentication);
    }
    
    /**
     * Gets all sessions for the authenticated user (patient or doctor)
     * Roles: PATIENT, DOCTOR
     */
    @GetMapping("/my-sessions")
    public List<VideoSessionResponse> getMySessionsOld(Authentication authentication) {
        // Kept for backward compatibility
        String userId = authentication.getName();
        log.info("Fetching sessions for user: {}", userId);
        return videoSessionService.getPatientSessions(userId, authentication);
    }
    
    /**
     * Gets all sessions for the authenticated user
     * Roles: PATIENT, DOCTOR
     */
    @GetMapping
    public List<VideoSessionResponse> getMySessions(Authentication authentication) {
        String userId = authentication.getName();
        log.info("Fetching sessions for user: {}", userId);
        boolean isDoctor = authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_DOCTOR".equals(authority.getAuthority()));

        if (isDoctor) {
            return videoSessionService.getDoctorSessions(userId, authentication);
        }

        return videoSessionService.getPatientSessions(userId, authentication);
    }
    
    /**
     * Gets upcoming/scheduled sessions for the authenticated user
     * Roles: PATIENT, DOCTOR
     */
    @GetMapping("/upcoming")
    public List<VideoSessionResponse> getUpcomingSessions(
        @RequestParam(required = false, defaultValue = "false") boolean isDoctor,
        Authentication authentication) {
        String userId = authentication.getName();
        log.info("Fetching upcoming sessions for user: {}", userId);
        return videoSessionService.getUpcomingSessions(userId, isDoctor, authentication);
    }
    
    /**
     * Gets all sessions for a specific doctor
     * Roles: DOCTOR (own sessions), ADMIN
     */
    @GetMapping("/doctor/{doctorId}")
    public List<VideoSessionResponse> getDoctorSessions(@PathVariable String doctorId, Authentication authentication) {
        log.info("Fetching sessions for doctor: {}", doctorId);
        return videoSessionService.getDoctorSessions(doctorId, authentication);
    }
    
    /**
     * Gets all sessions for a specific patient
     * Roles: PATIENT (own sessions), ADMIN
     */
    @GetMapping("/patient/{patientId}")
    public List<VideoSessionResponse> getPatientSessions(@PathVariable String patientId, Authentication authentication) {
        log.info("Fetching sessions for patient: {}", patientId);
        return videoSessionService.getPatientSessions(patientId, authentication);
    }
}
