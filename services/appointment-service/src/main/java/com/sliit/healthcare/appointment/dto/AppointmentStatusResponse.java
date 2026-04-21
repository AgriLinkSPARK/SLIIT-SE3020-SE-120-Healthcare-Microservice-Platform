package com.sliit.healthcare.appointment.dto;

import java.time.Instant;

import com.sliit.healthcare.appointment.model.Appointment.AppointmentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppointmentStatusResponse {
    private String appointmentId;
    private AppointmentStatus status;
    private Instant updatedAt;
}
