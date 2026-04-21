package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.VideoConsultationResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Appointment;
import com.sliit.healthcare.patient.model.VideoConsultation;
import com.sliit.healthcare.patient.repository.AppointmentRepository;
import com.sliit.healthcare.patient.repository.PatientRepository;
import com.sliit.healthcare.patient.repository.VideoConsultationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoConsultationService {

    private final VideoConsultationRepository videoConsultationRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public List<VideoConsultationResponseDto> getConsultationsByPatientId(String patientId) {
        validatePatientExists(patientId);
        log.info("Fetching video consultations for patient: {}", patientId);
        return videoConsultationRepository.findByPatientIdOrderByScheduledStartDesc(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VideoConsultationResponseDto getConsultationById(String consultationId) {
        VideoConsultation consultation = videoConsultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("VideoConsultation", "id", consultationId));
        return mapToResponseDto(consultation);
    }

    @Transactional(readOnly = true)
    public VideoConsultationResponseDto getConsultationByAppointmentId(String appointmentId) {
        VideoConsultation consultation = videoConsultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("VideoConsultation", "appointmentId", appointmentId));
        return mapToResponseDto(consultation);
    }

    @Transactional
    public VideoConsultationResponseDto createConsultation(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        Optional<VideoConsultation> existing = videoConsultationRepository.findByAppointmentId(appointmentId);
        if (existing.isPresent()) {
            log.info("Consultation already exists for appointment: {}", appointmentId);
            return mapToResponseDto(existing.get());
        }

        log.info("Creating video consultation for appointment: {}", appointmentId);

        String meetingId = UUID.randomUUID().toString().substring(0, 10);
        String meetingLink = "https://meet.healthcare.com/" + meetingId;
        String passcode = UUID.randomUUID().toString().substring(0, 6);

        VideoConsultation consultation = VideoConsultation.builder()
                .appointmentId(appointmentId)
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .meetingLink(meetingLink)
                .meetingId(meetingId)
                .passcode(passcode)
                .status(VideoConsultation.ConsultationStatus.SCHEDULED)
                .scheduledStart(LocalDateTime.of(appointment.getAppointmentDate(), appointment.getAppointmentTime()))
                .createdAt(LocalDateTime.now())
                .build();

        VideoConsultation savedConsultation = videoConsultationRepository.save(consultation);
        log.info("Video consultation created with id: {}", savedConsultation.getId());
        return mapToResponseDto(savedConsultation);
    }

    @Transactional
    public VideoConsultationResponseDto startConsultation(String consultationId) {
        VideoConsultation consultation = videoConsultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("VideoConsultation", "id", consultationId));

        log.info("Starting consultation: {}", consultationId);
        consultation.setStatus(VideoConsultation.ConsultationStatus.IN_PROGRESS);
        consultation.setActualStart(LocalDateTime.now());

        VideoConsultation updated = videoConsultationRepository.save(consultation);
        return mapToResponseDto(updated);
    }

    @Transactional
    public VideoConsultationResponseDto endConsultation(String consultationId) {
        VideoConsultation consultation = videoConsultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("VideoConsultation", "id", consultationId));

        log.info("Ending consultation: {}", consultationId);
        consultation.setStatus(VideoConsultation.ConsultationStatus.COMPLETED);
        consultation.setActualEnd(LocalDateTime.now());

        VideoConsultation updated = videoConsultationRepository.save(consultation);
        return mapToResponseDto(updated);
    }

    @Transactional
    public void cancelConsultation(String consultationId) {
        VideoConsultation consultation = videoConsultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("VideoConsultation", "id", consultationId));

        log.info("Cancelling consultation: {}", consultationId);
        consultation.setStatus(VideoConsultation.ConsultationStatus.CANCELLED);
        videoConsultationRepository.save(consultation);
    }

    private void validatePatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", "id", patientId);
        }
    }

    private VideoConsultationResponseDto mapToResponseDto(VideoConsultation consultation) {
        return VideoConsultationResponseDto.builder()
                .id(consultation.getId())
                .appointmentId(consultation.getAppointmentId())
                .patientId(consultation.getPatientId())
                .doctorId(consultation.getDoctorId())
                .meetingLink(consultation.getMeetingLink())
                .meetingId(consultation.getMeetingId())
                .passcode(consultation.getPasscode())
                .status(consultation.getStatus())
                .scheduledStart(consultation.getScheduledStart())
                .scheduledEnd(consultation.getScheduledEnd())
                .actualStart(consultation.getActualStart())
                .actualEnd(consultation.getActualEnd())
                .recordingUrl(consultation.getRecordingUrl())
                .notes(consultation.getNotes())
                .createdAt(consultation.getCreatedAt())
                .build();
    }
}
