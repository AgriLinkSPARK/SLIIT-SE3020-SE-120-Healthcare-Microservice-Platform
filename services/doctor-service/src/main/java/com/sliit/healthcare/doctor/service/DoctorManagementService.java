package com.sliit.healthcare.doctor.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sliit.healthcare.doctor.dto.AppointmentDecisionRequest;
import com.sliit.healthcare.doctor.dto.AppointmentRequestCreateRequest;
import com.sliit.healthcare.doctor.dto.AvailabilityRequest;
import com.sliit.healthcare.doctor.dto.ConsultationCompleteRequest;
import com.sliit.healthcare.doctor.dto.ConsultationCreateRequest;
import com.sliit.healthcare.doctor.dto.DoctorCategoryResponse;
import com.sliit.healthcare.doctor.dto.DoctorProfileRequest;
import com.sliit.healthcare.doctor.dto.PrescriptionIssueRequest;
import com.sliit.healthcare.doctor.dto.PublicBookingDoctorResponse;
import com.sliit.healthcare.doctor.dto.PublicBookingSlotResponse;
import com.sliit.healthcare.doctor.model.AppointmentRequest;
import com.sliit.healthcare.doctor.model.AppointmentRequestStatus;
import com.sliit.healthcare.doctor.model.AvailabilitySlot;
import com.sliit.healthcare.doctor.model.ConsultationSession;
import com.sliit.healthcare.doctor.model.ConsultationStatus;
import com.sliit.healthcare.doctor.model.DigitalPrescription;
import com.sliit.healthcare.doctor.model.DoctorProfile;
import com.sliit.healthcare.doctor.model.PatientReport;
import com.sliit.healthcare.doctor.model.SlotStatus;
import com.sliit.healthcare.doctor.repository.AppointmentRequestRepository;
import com.sliit.healthcare.doctor.repository.AvailabilitySlotRepository;
import com.sliit.healthcare.doctor.repository.ConsultationSessionRepository;
import com.sliit.healthcare.doctor.repository.DigitalPrescriptionRepository;
import com.sliit.healthcare.doctor.repository.DoctorCategoryRepository;
import com.sliit.healthcare.doctor.repository.DoctorProfileRepository;
import com.sliit.healthcare.doctor.repository.PatientReportRepository;

@Service
public class DoctorManagementService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final AppointmentRequestRepository appointmentRequestRepository;
    private final ConsultationSessionRepository consultationSessionRepository;
    private final DigitalPrescriptionRepository digitalPrescriptionRepository;
    private final PatientReportRepository patientReportRepository;
    private final DoctorCategoryRepository doctorCategoryRepository;

    public DoctorManagementService(DoctorProfileRepository doctorProfileRepository,
            AvailabilitySlotRepository availabilitySlotRepository,
            AppointmentRequestRepository appointmentRequestRepository,
            ConsultationSessionRepository consultationSessionRepository,
            DigitalPrescriptionRepository digitalPrescriptionRepository,
            PatientReportRepository patientReportRepository,
            DoctorCategoryRepository doctorCategoryRepository) {
        this.doctorProfileRepository = doctorProfileRepository;
        this.availabilitySlotRepository = availabilitySlotRepository;
        this.appointmentRequestRepository = appointmentRequestRepository;
        this.consultationSessionRepository = consultationSessionRepository;
        this.digitalPrescriptionRepository = digitalPrescriptionRepository;
        this.patientReportRepository = patientReportRepository;
        this.doctorCategoryRepository = doctorCategoryRepository;
    }

    public List<DoctorCategoryResponse> getDoctorCategories() {
        return doctorCategoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(category -> DoctorCategoryResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .description(category.getDescription())
                        .displayOrder(category.getDisplayOrder())
                        .build())
                .toList();
    }

    public DoctorProfile upsertProfile(String doctorId, DoctorProfileRequest request) {
        DoctorProfile profile = doctorProfileRepository.findByDoctorId(doctorId)
                .orElse(DoctorProfile.builder().doctorId(doctorId).createdAt(Instant.now()).build());

        profile.setFullName(request.getFullName());
        profile.setEmail(request.getEmail().toLowerCase());
        profile.setSpecialization(request.getSpecialization());
        profile.setQualifications(request.getQualifications());
        profile.setBio(request.getBio());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setConsultationFee(request.getConsultationFee());
        profile.setPhone(request.getPhone());
        profile.setUpdatedAt(Instant.now());

        return doctorProfileRepository.save(profile);
    }

    public DoctorProfile getProfile(String doctorId) {
        return doctorProfileRepository.findByDoctorId(doctorId).orElse(null);
    }

    public List<PublicBookingDoctorResponse> getPublicBookingOptions(String specialty, String doctorName, String date) {
        String normalizedSpecialty = specialty == null ? null : specialty.trim().toLowerCase();
        String normalizedDoctorName = doctorName == null ? null : doctorName.trim().toLowerCase();
        LocalDate scheduleDate = parseScheduleDate(date);

        Map<String, List<PublicBookingSlotResponse>> slotsByDoctor = availabilitySlotRepository.findAll().stream()
            .filter(slot -> slot.getStatus() == null || slot.getStatus() == SlotStatus.AVAILABLE)
            .filter(slot -> scheduleDate == null || slotMatchesDate(slot, scheduleDate))
            .sorted(Comparator.comparing(AvailabilitySlot::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(this::toPublicBookingSlotResponse)
            .collect(Collectors.groupingBy(
                PublicBookingSlotResponse::getDoctorId,
                LinkedHashMap::new,
                Collectors.toList()));

        Map<String, DoctorProfile> profileByDoctorId = doctorProfileRepository.findAll().stream()
                .collect(Collectors.toMap(DoctorProfile::getDoctorId, profile -> profile, (left, right) -> left,
                        HashMap::new));

        Set<String> doctorIds = new HashSet<>(slotsByDoctor.keySet());
        doctorIds.addAll(profileByDoctorId.keySet());

        return doctorIds.stream()
                .map(doctorId -> toPublicDoctorResponse(doctorId, profileByDoctorId.get(doctorId), slotsByDoctor))
                .filter(response -> !response.getAvailabilitySlots().isEmpty())
            .filter(response -> matchesSpecialty(response, normalizedSpecialty))
                .filter(response -> normalizedDoctorName == null || normalizedDoctorName.isBlank()
                        || (response.getFullName() != null
                                && response.getFullName().toLowerCase().contains(normalizedDoctorName)))
                .sorted(Comparator.comparing(PublicBookingDoctorResponse::getFullName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private PublicBookingDoctorResponse toPublicDoctorResponse(String doctorId,
            DoctorProfile profile,
            Map<String, List<PublicBookingSlotResponse>> slotsByDoctor) {
        List<PublicBookingSlotResponse> slots = slotsByDoctor.getOrDefault(doctorId, List.of());

        if (profile == null) {
            return PublicBookingDoctorResponse.builder()
                    .doctorId(doctorId)
                    .fullName("Doctor " + shortDoctorId(doctorId))
                    .specialization(resolveDoctorSpecialization(null, slots))
                    .qualifications(null)
                    .bio(null)
                    .yearsOfExperience(0)
                    .consultationFee(null)
                    .phone(null)
                    .verified(false)
                    .availabilitySlots(slots)
                    .build();
        }

        return PublicBookingDoctorResponse.builder()
                .doctorId(profile.getDoctorId())
                .fullName(profile.getFullName())
                .specialization(resolveDoctorSpecialization(profile, slots))
                .qualifications(profile.getQualifications())
                .bio(profile.getBio())
                .yearsOfExperience(profile.getYearsOfExperience())
                .consultationFee(profile.getConsultationFee())
                .phone(profile.getPhone())
                .verified(profile.isVerified())
                .availabilitySlots(slots)
                .build();
    }

    private String resolveDoctorSpecialization(DoctorProfile profile, List<PublicBookingSlotResponse> slots) {
        if (profile != null && profile.getSpecialization() != null && !profile.getSpecialization().isBlank()) {
            return profile.getSpecialization();
        }

        return slots.stream()
                .map(PublicBookingSlotResponse::getSpecialization)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse("General Consultation");
    }

    private boolean matchesSpecialty(PublicBookingDoctorResponse response, String normalizedSpecialty) {
        if (normalizedSpecialty == null || normalizedSpecialty.isBlank()) {
            return true;
        }

        if (response.getSpecialization() != null
                && response.getSpecialization().toLowerCase().contains(normalizedSpecialty)) {
            return true;
        }

        return response.getAvailabilitySlots().stream()
                .map(PublicBookingSlotResponse::getSpecialization)
                .filter(value -> value != null && !value.isBlank())
                .anyMatch(value -> value.toLowerCase().contains(normalizedSpecialty));
    }

    private String shortDoctorId(String doctorId) {
        if (doctorId == null || doctorId.isBlank()) {
            return "Unknown";
        }
        return doctorId.length() <= 6 ? doctorId : doctorId.substring(0, 6);
    }

    private LocalDate parseScheduleDate(String date) {
        if (date == null || date.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(date);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date format. Expected yyyy-MM-dd");
        }
    }

    private boolean slotMatchesDate(AvailabilitySlot slot, LocalDate targetDate) {
        if (slot.getStartTime() == null) {
            return false;
        }

        LocalDate slotDate = slot.getStartTime().atZone(ZoneId.systemDefault()).toLocalDate();
        return slotDate.equals(targetDate);
    }

    public AvailabilitySlot createAvailability(String doctorId, AvailabilityRequest request) {
        validateSlotTime(request.getStartTime(), request.getEndTime());
        validateSlotCapacity(request.getOnlineCapacity(), request.getPhysicalCapacity());
        String normalizedSpecialization = validateAndNormalizeSpecialization(request.getSpecialization());
        BigDecimal consultationFee = validateAndNormalizeConsultationFee(request.getConsultationFee());

        AvailabilitySlot slot = AvailabilitySlot.builder()
                .doctorId(doctorId)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .locationType(request.getLocationType())
                .status(request.getStatus() == null ? SlotStatus.AVAILABLE : request.getStatus())
                .onlineCapacity(request.getOnlineCapacity())
                .physicalCapacity(request.getPhysicalCapacity())
                .specialization(normalizedSpecialization)
                .consultationFee(consultationFee)
                .notes(request.getNotes())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return availabilitySlotRepository.save(slot);
    }

    public List<AvailabilitySlot> getAvailability(String doctorId) {
        return availabilitySlotRepository.findByDoctorIdOrderByStartTimeAsc(doctorId);
    }

    private PublicBookingSlotResponse toPublicBookingSlotResponse(AvailabilitySlot slot) {
        return PublicBookingSlotResponse.builder()
                .slotId(slot.getId())
                .doctorId(slot.getDoctorId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .locationType(slot.getLocationType())
                .status(slot.getStatus())
                .onlineCapacity(slot.getOnlineCapacity())
                .physicalCapacity(slot.getPhysicalCapacity())
                .specialization(slot.getSpecialization())
                .consultationFee(slot.getConsultationFee())
                .notes(slot.getNotes())
                .build();
    }

    public AvailabilitySlot updateAvailability(String doctorId, String slotId, AvailabilityRequest request) {
        validateSlotTime(request.getStartTime(), request.getEndTime());
        validateSlotCapacity(request.getOnlineCapacity(), request.getPhysicalCapacity());
        String normalizedSpecialization = validateAndNormalizeSpecialization(request.getSpecialization());
        BigDecimal consultationFee = validateAndNormalizeConsultationFee(request.getConsultationFee());

        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability slot not found"));
        ensureDoctorOwnership(doctorId, slot.getDoctorId());

        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setLocationType(request.getLocationType());
        slot.setOnlineCapacity(request.getOnlineCapacity());
        slot.setPhysicalCapacity(request.getPhysicalCapacity());
        slot.setSpecialization(normalizedSpecialization);
        slot.setConsultationFee(consultationFee);
        if (request.getStatus() != null) {
            slot.setStatus(request.getStatus());
        }
        slot.setNotes(request.getNotes());
        slot.setUpdatedAt(Instant.now());

        return availabilitySlotRepository.save(slot);
    }

    public void deleteAvailability(String doctorId, String slotId) {
        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability slot not found"));
        ensureDoctorOwnership(doctorId, slot.getDoctorId());
        availabilitySlotRepository.deleteById(slotId);
    }

    public AppointmentRequest createAppointmentRequest(String doctorId, AppointmentRequestCreateRequest request) {
        AppointmentRequest entity = AppointmentRequest.builder()
                .appointmentId(request.getAppointmentId())
                .doctorId(doctorId)
                .patientId(request.getPatientId())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentRequestStatus.PENDING)
                .requestedAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return appointmentRequestRepository.save(entity);
    }

    public List<AppointmentRequest> getAppointmentRequests(String doctorId) {
        return appointmentRequestRepository.findByDoctorIdOrderByRequestedAtDesc(doctorId);
    }

    public AppointmentRequest acceptAppointmentRequest(String doctorId, String requestId) {
        AppointmentRequest request = getAppointmentRequestOwnedByDoctor(doctorId, requestId);
        request.setStatus(AppointmentRequestStatus.ACCEPTED);
        request.setUpdatedAt(Instant.now());
        return appointmentRequestRepository.save(request);
    }

    public AppointmentRequest rejectAppointmentRequest(String doctorId, String requestId, AppointmentDecisionRequest decision) {
        AppointmentRequest request = getAppointmentRequestOwnedByDoctor(doctorId, requestId);
        request.setStatus(AppointmentRequestStatus.REJECTED);
        request.setDecisionReason(decision == null ? null : decision.getReason());
        request.setUpdatedAt(Instant.now());
        return appointmentRequestRepository.save(request);
    }

    public ConsultationSession createConsultation(String doctorId, ConsultationCreateRequest request) {
        ConsultationSession session = ConsultationSession.builder()
                .consultationId(request.getConsultationId())
                .doctorId(doctorId)
                .patientId(request.getPatientId())
                .appointmentId(request.getAppointmentId())
                .meetingUrl(request.getMeetingUrl())
                .scheduledAt(request.getScheduledAt())
                .status(ConsultationStatus.SCHEDULED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return consultationSessionRepository.save(session);
    }

    public List<ConsultationSession> getConsultations(String doctorId) {
        return consultationSessionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    public ConsultationSession startConsultation(String doctorId, String consultationId) {
        ConsultationSession session = getConsultationOwnedByDoctor(doctorId, consultationId);
        session.setStatus(ConsultationStatus.ONGOING);
        session.setStartedAt(Instant.now());
        session.setUpdatedAt(Instant.now());
        return consultationSessionRepository.save(session);
    }

    public ConsultationSession completeConsultation(String doctorId, String consultationId,
            ConsultationCompleteRequest request) {
        ConsultationSession session = getConsultationOwnedByDoctor(doctorId, consultationId);
        session.setStatus(ConsultationStatus.COMPLETED);
        session.setEndedAt(Instant.now());
        session.setNotes(request == null ? null : request.getNotes());
        session.setUpdatedAt(Instant.now());
        return consultationSessionRepository.save(session);
    }

    public DigitalPrescription issuePrescription(String doctorId, PrescriptionIssueRequest request) {
        DigitalPrescription prescription = DigitalPrescription.builder()
                .prescriptionId(request.getPrescriptionId())
                .doctorId(doctorId)
                .patientId(request.getPatientId())
                .consultationId(request.getConsultationId())
                .diagnosis(request.getDiagnosis())
                .medications(request.getMedications())
                .additionalNotes(request.getAdditionalNotes())
                .issuedAt(Instant.now())
                .build();

        return digitalPrescriptionRepository.save(prescription);
    }

    public List<DigitalPrescription> getPrescriptions(String doctorId, String patientId) {
        if (patientId != null && !patientId.isBlank()) {
            return digitalPrescriptionRepository.findByPatientIdOrderByIssuedAtDesc(patientId);
        }
        return digitalPrescriptionRepository.findByDoctorIdOrderByIssuedAtDesc(doctorId);
    }

    public List<PatientReport> getPatientReports(String patientId) {
        return patientReportRepository.findByPatientIdOrderByUploadedAtDesc(patientId);
    }

    private AppointmentRequest getAppointmentRequestOwnedByDoctor(String doctorId, String requestId) {
        AppointmentRequest request = appointmentRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment request not found"));
        ensureDoctorOwnership(doctorId, request.getDoctorId());
        return request;
    }

    private ConsultationSession getConsultationOwnedByDoctor(String doctorId, String consultationId) {
        ConsultationSession session = consultationSessionRepository.findByConsultationId(consultationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultation not found"));
        ensureDoctorOwnership(doctorId, session.getDoctorId());
        return session;
    }

    private void ensureDoctorOwnership(String actingDoctorId, String ownerDoctorId) {
        if (!actingDoctorId.equals(ownerDoctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot modify another doctor's records");
        }
    }

    private void validateSlotTime(Instant startTime, Instant endTime) {
        if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
    }

    private void validateSlotCapacity(Integer onlineCapacity, Integer physicalCapacity) {
        int online = onlineCapacity == null ? 0 : onlineCapacity;
        int physical = physicalCapacity == null ? 0 : physicalCapacity;
        if (online < 0 || physical < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Schedule capacity cannot be negative");
        }
        if (online == 0 && physical == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "At least one schedule capacity must be greater than 0");
        }
    }

    private String validateAndNormalizeSpecialization(String specialization) {
        if (specialization == null || specialization.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor category is required for schedule");
        }
        return specialization.trim();
    }

    private BigDecimal validateAndNormalizeConsultationFee(BigDecimal consultationFee) {
        if (consultationFee == null || consultationFee.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Schedule consultation fee is required");
        }
        return consultationFee;
    }

    public String generateId() {
        return UUID.randomUUID().toString();
    }
}
