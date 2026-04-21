package com.sliit.healthcare.doctor.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointment_requests")
public class AppointmentRequest {

    @Id
    private String id;

    @Indexed
    private String appointmentId;

    @Indexed
    private String doctorId;

    private String patientId;
    private Instant appointmentTime;

    @Builder.Default
    private AppointmentRequestStatus status = AppointmentRequestStatus.PENDING;

    private String decisionReason;

    @Builder.Default
    private Instant requestedAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
