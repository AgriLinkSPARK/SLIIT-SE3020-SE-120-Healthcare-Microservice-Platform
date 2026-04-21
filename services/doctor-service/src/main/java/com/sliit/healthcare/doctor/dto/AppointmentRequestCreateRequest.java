package com.sliit.healthcare.doctor.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequestCreateRequest {

    @NotBlank
    private String appointmentId;

    @NotBlank
    private String patientId;

    @NotNull
    private Instant appointmentTime;
}
