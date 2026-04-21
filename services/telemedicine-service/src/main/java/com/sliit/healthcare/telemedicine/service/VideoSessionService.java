package com.sliit.healthcare.telemedicine.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sliit.healthcare.telemedicine.dto.CreateVideoSessionRequest;
import com.sliit.healthcare.telemedicine.dto.VideoSessionResponse;
import com.sliit.healthcare.telemedicine.model.VideoSession;
import com.sliit.healthcare.telemedicine.model.VideoSession.SessionStatus;
import com.sliit.healthcare.telemedicine.repository.VideoSessionRepository;

@Service
public class VideoSessionService {

    private static final Logger log = LoggerFactory.getLogger(VideoSessionService.class);
    
    private final VideoSessionRepository videoSessionRepository;
    private final JitsiService jitsiService;
    
    public VideoSessionService(VideoSessionRepository videoSessionRepository, JitsiService jitsiService) {
        this.videoSessionRepository = videoSessionRepository;
        this.jitsiService = jitsiService;
    }
    
    /**
     * Creates a new video session (scheduled video conference)
     */
    public VideoSessionResponse createVideoSession(CreateVideoSessionRequest request, Authentication authentication) {
        log.info("Creating video session for appointment: {}", request.getAppointmentId());

        ensureAuthenticated(authentication);
        ensureParticipantAccess(
            request.getPatientId(),
            request.getPatientEmail(),
            request.getDoctorId(),
            request.getDoctorEmail(),
            authentication);
        
        // Check if session already exists for this appointment
        if (videoSessionRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Video session already exists for this appointment");
        }
        
        // Generate unique identifiers
        String sessionId = UUID.randomUUID().toString();
        String roomName = jitsiService.generateRoomName(
            request.getAppointmentId(),
            request.getPatientId(),
            request.getDoctorId()
        );
        
        // Create video session document
        VideoSession session = new VideoSession();
        session.setSessionId(sessionId);
        session.setRoomName(roomName);
        session.setPatientId(request.getPatientId());
        session.setPatientName(request.getPatientName());
        session.setPatientEmail(request.getPatientEmail());
        session.setDoctorId(request.getDoctorId());
        session.setDoctorName(request.getDoctorName());
        session.setDoctorEmail(request.getDoctorEmail());
        session.setAppointmentId(request.getAppointmentId());
        session.setStatus(SessionStatus.SCHEDULED);
        session.setScheduledStartTime(parseScheduledStartTime(request.getScheduledStartTime()));
        session.setDurationMinutes(request.getDurationMinutes());
        session.setNotes(request.getNotes());
        session.setCreatedAt(Instant.now());
        session.setUpdatedAt(Instant.now());
        
        VideoSession saved = videoSessionRepository.save(session);
        log.info("Video session created with ID: {}", sessionId);
        
        return mapToResponse(saved);
    }
    
    /**
     * Gets a video session by ID
     */
    public VideoSessionResponse getVideoSession(String sessionId, Authentication authentication) {
        VideoSession session = videoSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video session not found"));
        ensureSessionAccess(session, authentication);
        return mapToResponse(session);
    }

    /**
     * Gets a video session by appointment ID
     */
    public VideoSessionResponse getVideoSessionByAppointmentId(String appointmentId, Authentication authentication) {
        VideoSession session = videoSessionRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video session not found"));
        ensureSessionAccess(session, authentication);
        return mapToResponse(session);
    }
    
    /**
     * Starts a video session and generates Jitsi tokens
     * Called when patient or doctor joins the conference
     */
    public String startVideoSession(String sessionId, Authentication authentication, String userDisplayName, String userEmail) {
        log.info("Starting video session: {}", sessionId);

        ensureAuthenticated(authentication);
        String userId = authentication.getName();
        
        VideoSession session = videoSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video session not found"));

        ensureSessionAccess(session, authentication);
        
        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot start a cancelled session");
        }
        
        // Allow rejoin for completed sessions by moving back to IN_PROGRESS and issuing a fresh URL.
        if (session.getStatus() == SessionStatus.SCHEDULED || session.getStatus() == SessionStatus.COMPLETED) {
            session.setStatus(SessionStatus.IN_PROGRESS);
            if (session.getActualStartTime() == null) {
                session.setActualStartTime(Instant.now());
            }
            session.setEndTime(null);
            session.setUpdatedAt(Instant.now());
            videoSessionRepository.save(session);
        }
        
        // Determine if user is moderator (doctor)
        boolean isModerator = session.getDoctorId().equals(userId);
        
        String jitsiMeetUrl = jitsiService.generateJitsiMeetUrl(session.getRoomName(), null);
        
        // Update session with Jitsi details
        session.setJitsiMeetLink(jitsiMeetUrl);
        session.setJitsiRoomId(session.getRoomName());
        videoSessionRepository.save(session);
        
        log.info("Video session started with Jitsi room: {}", session.getRoomName());
        return jitsiMeetUrl;
    }
    
    /**
     * Ends a video session (marks as COMPLETED)
     */
    public VideoSessionResponse endVideoSession(String sessionId, Authentication authentication) {
        log.info("Ending video session: {}", sessionId);
        
        VideoSession session = videoSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video session not found"));

        ensureCanManageSession(session, authentication);
        
        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session already completed");
        }
        
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndTime(Instant.now());
        session.setUpdatedAt(Instant.now());
        
        VideoSession saved = videoSessionRepository.save(session);
        log.info("Video session ended: {}", sessionId);
        
        return mapToResponse(saved);
    }
    
    /**
     * Cancels a video session
     */
    public VideoSessionResponse cancelVideoSession(String sessionId, String reason, Authentication authentication) {
        log.info("Cancelling video session: {}", sessionId);
        
        VideoSession session = videoSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video session not found"));

        ensureCanManageSession(session, authentication);
        
        if (session.getStatus() == SessionStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot cancel a session in progress");
        }
        
        session.setStatus(SessionStatus.CANCELLED);
        session.setNotes((session.getNotes() != null ? session.getNotes() + " | " : "") + "Cancelled: " + reason);
        session.setUpdatedAt(Instant.now());
        
        VideoSession saved = videoSessionRepository.save(session);
        return mapToResponse(saved);
    }
    
    /**
     * Gets all video sessions for a patient
     */
    public List<VideoSessionResponse> getPatientSessions(String patientId, Authentication authentication) {
        ensureAuthenticated(authentication);
        ensureOwnerOrAdmin(patientId, authentication);
        return videoSessionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Gets all video sessions for a doctor
     */
    public List<VideoSessionResponse> getDoctorSessions(String doctorId, Authentication authentication) {
        ensureAuthenticated(authentication);
        ensureOwnerOrAdmin(doctorId, authentication);
        return videoSessionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Gets upcoming sessions (scheduled or in progress)
     */
    public List<VideoSessionResponse> getUpcomingSessions(String userId, boolean isDoctor, Authentication authentication) {
        ensureAuthenticated(authentication);
        ensureOwnerOrAdmin(userId, authentication);
        if (isDoctor) {
            return videoSessionRepository.findByDoctorIdAndStatus(userId, SessionStatus.SCHEDULED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        } else {
            return videoSessionRepository.findByPatientIdAndStatus(userId, SessionStatus.SCHEDULED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        }
    }
    
    /**
     * Maps VideoSession entity to DTO
     */
    private VideoSessionResponse mapToResponse(VideoSession session) {
        VideoSessionResponse response = new VideoSessionResponse();
        response.setSessionId(session.getSessionId());
        response.setRoomName(session.getRoomName());
        response.setPatientId(session.getPatientId());
        response.setPatientName(session.getPatientName());
        response.setPatientEmail(session.getPatientEmail());
        response.setDoctorId(session.getDoctorId());
        response.setDoctorName(session.getDoctorName());
        response.setDoctorEmail(session.getDoctorEmail());
        response.setAppointmentId(session.getAppointmentId());
        response.setStatus(session.getStatus());
        response.setScheduledStartTime(session.getScheduledStartTime());
        response.setActualStartTime(session.getActualStartTime());
        response.setEndTime(session.getEndTime());
        response.setJitsiMeetLink(session.getJitsiMeetLink());
        response.setDurationMinutes(session.getDurationMinutes());
        response.setNotes(session.getNotes());
        response.setCreatedAt(session.getCreatedAt());
        return response;
    }

    private void ensureAuthenticated(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
    }

    private void ensureOwnerOrAdmin(String ownerId, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }

        if (!matchesAuthenticatedUser(authentication, ownerId, ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access this video session");
        }
    }

    private void ensureParticipantAccess(String patientId, String patientEmail, String doctorId, String doctorEmail, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }

        boolean matchesPatient = matchesAuthenticatedUser(authentication, patientId, patientEmail);
        boolean matchesDoctor = matchesAuthenticatedUser(authentication, doctorId, doctorEmail);

        if (matchesPatient || matchesDoctor) {
            return;
        }

        // Allow authenticated doctors and patients to create sessions for booked appointments
        // even if payload IDs are not perfectly aligned with token subject formatting.
        if (isDoctor(authentication) || isPatient(authentication)) {
            log.warn("Session create identity mismatch tolerated for user={} patientId={} doctorId={}",
                    authentication.getName(), patientId, doctorId);
            return;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to create this video session");
    }

    private void ensureSessionAccess(VideoSession session, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }

        if (!matchesAuthenticatedUser(authentication, session.getPatientId(), session.getPatientEmail())
                && !matchesAuthenticatedUser(authentication, session.getDoctorId(), session.getDoctorEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access this video session");
        }
    }

    private void ensureCanManageSession(VideoSession session, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }

        if (!isDoctor(authentication) || !matchesAuthenticatedUser(authentication, session.getDoctorId(), session.getDoctorEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned doctor can manage this video session");
        }
    }

    private boolean matchesAuthenticatedUser(Authentication authentication, String userId, String email) {
        if (authentication == null) {
            return false;
        }

        String authenticatedUserId = authentication.getName();
        if (userId != null && !userId.isBlank() && authenticatedUserId.equals(userId)) {
            return true;
        }

        if (email == null || email.isBlank()) {
            return false;
        }

        String authenticatedEmail = getAuthenticatedEmail(authentication);
        if (authenticatedEmail != null && email.equalsIgnoreCase(authenticatedEmail)) {
            return true;
        }

        return authenticatedUserId != null && email.equalsIgnoreCase(authenticatedUserId);
    }

    private String getAuthenticatedEmail(Authentication authentication) {
        Object details = authentication == null ? null : authentication.getDetails();
        return details instanceof String ? (String) details : null;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private boolean isDoctor(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_DOCTOR".equals(authority.getAuthority()));
    }

    private boolean isPatient(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_PATIENT".equals(authority.getAuthority()));
    }

    private Instant parseScheduledStartTime(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Scheduled start time is required");
        }

        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ignored) {
            // Fall back to LocalDateTime values without timezone information.
        }

        try {
            return LocalDateTime.parse(value).toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid scheduled start time format. Use ISO-8601 datetime.");
        }
    }
}
