package com.sliit.healthcare.patient.dto;

import com.sliit.healthcare.patient.model.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {

    private String id;
    private String patientId;
    private String doctorId;
    private String doctorName;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reason;
    private String notes;
    private Appointment.AppointmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
