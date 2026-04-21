package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.AppointmentRequestDto;
import com.sliit.healthcare.patient.dto.AppointmentResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.Appointment;
import com.sliit.healthcare.patient.repository.AppointmentRepository;
import com.sliit.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAppointmentsByPatientId(String patientId) {
        validatePatientExists(patientId);
        log.info("Fetching appointments for patient: {}", patientId);
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getUpcomingAppointments(String patientId) {
        validatePatientExists(patientId);
        log.info("Fetching upcoming appointments for patient: {}", patientId);
        return appointmentRepository.findByPatientIdAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAsc(
                        patientId, LocalDate.now()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));
        return mapToResponseDto(appointment);
    }

    @Transactional
    public AppointmentResponseDto bookAppointment(String patientId, AppointmentRequestDto requestDto) {
        validatePatientExists(patientId);
        log.info("Booking appointment for patient: {} with doctor: {}", patientId, requestDto.getDoctorId());

        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .doctorId(requestDto.getDoctorId())
                .doctorName(requestDto.getDoctorName())
                .appointmentDate(requestDto.getAppointmentDate())
                .appointmentTime(requestDto.getAppointmentTime())
                .reason(requestDto.getReason())
                .notes(requestDto.getNotes())
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .createdAt(LocalDateTime.now())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Appointment booked successfully with id: {}", savedAppointment.getId());
        return mapToResponseDto(savedAppointment);
    }

    @Transactional
    public AppointmentResponseDto updateAppointment(String appointmentId, AppointmentRequestDto requestDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        log.info("Updating appointment: {}", appointmentId);
        appointment.setDoctorId(requestDto.getDoctorId());
        appointment.setDoctorName(requestDto.getDoctorName());
        appointment.setAppointmentDate(requestDto.getAppointmentDate());
        appointment.setAppointmentTime(requestDto.getAppointmentTime());
        appointment.setReason(requestDto.getReason());
        appointment.setNotes(requestDto.getNotes());
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToResponseDto(updatedAppointment);
    }

    @Transactional
    public void cancelAppointment(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        log.info("Cancelling appointment: {}", appointmentId);
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setUpdatedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointment(String appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new ResourceNotFoundException("Appointment", "id", appointmentId);
        }
        log.info("Deleting appointment: {}", appointmentId);
        appointmentRepository.deleteById(appointmentId);
    }

    private void validatePatientExists(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", "id", patientId);
        }
    }

    private AppointmentResponseDto mapToResponseDto(Appointment appointment) {
        return AppointmentResponseDto.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .doctorName(appointment.getDoctorName())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .status(appointment.getStatus())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}
