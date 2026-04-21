package com.sliit.healthcare.doctor.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConsultationCreateRequest {

    @NotBlank
    private String consultationId;

    @NotBlank
    private String appointmentId;

    @NotBlank
    private String patientId;

    @NotBlank
    private String meetingUrl;

    @NotNull
    private Instant scheduledAt;
}
