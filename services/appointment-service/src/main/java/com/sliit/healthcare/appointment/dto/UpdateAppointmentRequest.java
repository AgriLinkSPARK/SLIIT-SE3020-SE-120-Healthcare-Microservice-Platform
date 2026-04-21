package com.sliit.healthcare.appointment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.sliit.healthcare.appointment.model.Appointment.AppointmentType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import lombok.Data;

@Data
public class UpdateAppointmentRequest {

    private String doctorName;

    private String specialty;

    private AppointmentType type;

    @Future(message = "Appointment date and time must be in the future")
    private LocalDateTime appointmentDateTime;

    private String notes;

    @DecimalMin(value = "0.0", inclusive = false, message = "Fee must be greater than 0")
    private BigDecimal fee;
}
