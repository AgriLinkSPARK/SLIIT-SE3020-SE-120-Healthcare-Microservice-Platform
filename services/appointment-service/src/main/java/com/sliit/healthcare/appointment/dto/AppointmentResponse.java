package com.sliit.healthcare.appointment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

import com.sliit.healthcare.appointment.model.Appointment.AppointmentStatus;
import com.sliit.healthcare.appointment.model.Appointment.AppointmentType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppointmentResponse {

    private String id;
    private String patientId;
    private String doctorId;
    private String slotId;
    private String doctorName;
    private String specialty;
    private AppointmentType type;
    private AppointmentStatus status;
    private LocalDateTime appointmentDateTime;
    private String notes;
    private BigDecimal fee;
    private Instant createdAt;
    private Instant updatedAt;
}
