package com.sliit.healthcare.appointment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.sliit.healthcare.appointment.model.Appointment.AppointmentType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAppointmentRequest {

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @NotBlank(message = "Doctor ID is required")
    private String doctorId;

    @NotBlank(message = "Schedule slot ID is required")
    private String slotId;

    @NotBlank(message = "Specialty is required")
    private String specialty;

    @NotNull(message = "Appointment type is required")
    private AppointmentType type;

    @NotNull(message = "Appointment date and time is required")
    @Future(message = "Appointment date and time must be in the future")
    private LocalDateTime appointmentDateTime;

    private String notes;

    @NotNull(message = "Fee is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Fee must be greater than 0")
    private BigDecimal fee;

    @NotNull(message = "Online capacity is required")
    private Integer onlineCapacity;

    @NotNull(message = "Physical capacity is required")
    private Integer physicalCapacity;
}
