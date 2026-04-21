package com.sliit.healthcare.appointment.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sliit.healthcare.appointment.client.DoctorServiceClient;
import com.sliit.healthcare.appointment.dto.AppointmentResponse;
import com.sliit.healthcare.appointment.dto.AppointmentStatusResponse;
import com.sliit.healthcare.appointment.dto.CreateAppointmentRequest;
import com.sliit.healthcare.appointment.dto.DoctorSearchResponse;
import com.sliit.healthcare.appointment.dto.UpdateAppointmentRequest;
import com.sliit.healthcare.appointment.model.Appointment;
import com.sliit.healthcare.appointment.model.Appointment.AppointmentStatus;
import com.sliit.healthcare.appointment.model.Appointment.AppointmentType;
import com.sliit.healthcare.appointment.repository.AppointmentRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorServiceClient doctorServiceClient) {
        this.appointmentRepository = appointmentRepository;
        this.doctorServiceClient = doctorServiceClient;
    }

    /**
     * Searches doctors by specialty by calling the doctor-service REST API.
     * Doctor data is fetched from the database — not hardcoded.
     */
    public List<DoctorSearchResponse> searchDoctorsBySpecialty(String specialty) {
        List<DoctorSearchResponse> doctors = doctorServiceClient.searchDoctors(specialty);
        return doctors.stream()
                .sorted(Comparator.comparing(DoctorSearchResponse::getDoctorName,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();
    }


    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        if (appointmentRepository.existsByPatientIdAndSlotIdAndTypeAndStatusNot(
                request.getPatientId().trim(),
                request.getSlotId().trim(),
                request.getType(),
                AppointmentStatus.CANCELLED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You already have an active appointment for this schedule and appointment type");
        }

        validateDoctorSlotAvailability(
            request.getSlotId(),
            request.getType(),
            request.getOnlineCapacity(),
            request.getPhysicalCapacity());

        Instant now = Instant.now();
        Appointment appointment = Appointment.builder()
                .patientId(request.getPatientId().trim())
            .doctorId(request.getDoctorId().trim())
            .slotId(request.getSlotId().trim())
                .doctorName(request.getDoctorName().trim())
                .specialty(request.getSpecialty().trim())
                .type(request.getType())
                .status(AppointmentStatus.BOOKED)
                .appointmentDateTime(request.getAppointmentDateTime())
                .notes(request.getNotes())
                .fee(request.getFee())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> getAppointments(Optional<String> patientId,
            Optional<String> specialty,
            Optional<AppointmentType> type,
            Optional<AppointmentStatus> status) {
        List<Appointment> appointments = status
                .map(appointmentRepository::findByStatusOrderByAppointmentDateTimeDesc)
                .orElseGet(appointmentRepository::findAllByOrderByAppointmentDateTimeDesc);

        Stream<Appointment> stream = appointments.stream();

        if (patientId.isPresent() && !patientId.get().isBlank()) {
            String normalizedPatientId = patientId.get().trim();
            stream = stream.filter(appointment -> normalizedPatientId.equalsIgnoreCase(appointment.getPatientId()));
        }

        if (specialty.isPresent() && !specialty.get().isBlank()) {
            String normalizedSpecialty = specialty.get().trim().toLowerCase();
            stream = stream.filter(appointment -> appointment.getSpecialty() != null
                    && appointment.getSpecialty().toLowerCase().contains(normalizedSpecialty));
        }

        if (type.isPresent()) {
            AppointmentType appointmentType = type.get();
            stream = stream.filter(appointment -> appointment.getType() == appointmentType);
        }

        return stream
                .sorted(Comparator.comparing(Appointment::getAppointmentDateTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    public List<AppointmentResponse> getDoctorAppointments(String doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateTimeDesc(doctorId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AppointmentResponse> getPatientAppointments(String patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AppointmentResponse> searchAppointments(String specialty, Optional<AppointmentType> type) {
        if (specialty == null || specialty.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "specialty is required");
        }

        List<Appointment> appointments = type
                .map(appointmentType -> appointmentRepository
                        .findBySpecialtyContainingIgnoreCaseAndTypeAndStatusNotOrderByAppointmentDateTimeAsc(
                                specialty,
                                appointmentType,
                                AppointmentStatus.CANCELLED
                        ))
                .orElseGet(() -> appointmentRepository
                        .findBySpecialtyContainingIgnoreCaseAndStatusNotOrderByAppointmentDateTimeAsc(
                                specialty,
                                AppointmentStatus.CANCELLED
                        ));

        return appointments.stream().map(this::toResponse).toList();
    }

    public AppointmentResponse getAppointmentById(String id) {
        return toResponse(requireAppointment(id));
    }

    public AppointmentResponse updateAppointment(String id, UpdateAppointmentRequest request) {
        Appointment appointment = requireAppointment(id);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed or cancelled appointments cannot be modified");
        }

        if (request.getDoctorName() != null && !request.getDoctorName().isBlank()) {
            appointment.setDoctorName(request.getDoctorName().trim());
        }
        if (request.getSpecialty() != null && !request.getSpecialty().isBlank()) {
            appointment.setSpecialty(request.getSpecialty().trim());
        }
        if (request.getType() != null) {
            appointment.setType(request.getType());
        }
        if (request.getAppointmentDateTime() != null) {
            appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        }
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }
        if (request.getFee() != null) {
            appointment.setFee(request.getFee());
        }

        appointment.setUpdatedAt(Instant.now());
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse cancelAppointment(String id) {
        Appointment appointment = requireAppointment(id);
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            return toResponse(appointment);
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setUpdatedAt(Instant.now());
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse updateStatus(String id, AppointmentStatus status) {
        Appointment appointment = requireAppointment(id);
        appointment.setStatus(status);
        appointment.setUpdatedAt(Instant.now());
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentStatusResponse getStatus(String id) {
        Appointment appointment = requireAppointment(id);
        return AppointmentStatusResponse.builder()
                .appointmentId(appointment.getId())
                .status(appointment.getStatus())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }

        private void validateDoctorSlotAvailability(String slotId,
            AppointmentType type,
            Integer onlineCapacity,
            Integer physicalCapacity) {
        int allowedCount = type == AppointmentType.ONLINE_VIDEO
            ? (onlineCapacity == null ? 0 : onlineCapacity)
            : (physicalCapacity == null ? 0 : physicalCapacity);

        if (allowedCount <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "No remaining capacity for selected appointment type in this schedule");
        }

        long alreadyBooked = appointmentRepository.countBySlotIdAndTypeAndStatusNot(
            slotId,
            type,
            AppointmentStatus.CANCELLED);

        if (alreadyBooked >= allowedCount) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Selected schedule is fully booked for this appointment type");
        }
    }

    private Appointment requireAppointment(String id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
            .doctorId(appointment.getDoctorId())
            .slotId(appointment.getSlotId())
                .doctorName(appointment.getDoctorName())
                .specialty(appointment.getSpecialty())
                .type(appointment.getType())
                .status(appointment.getStatus())
                .appointmentDateTime(appointment.getAppointmentDateTime())
                .notes(appointment.getNotes())
                .fee(appointment.getFee())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}
