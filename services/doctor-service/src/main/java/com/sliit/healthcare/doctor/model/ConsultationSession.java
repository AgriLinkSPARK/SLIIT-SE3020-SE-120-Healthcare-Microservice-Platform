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
@Document(collection = "consultation_sessions")
public class ConsultationSession {

    @Id
    private String id;

    @Indexed
    private String consultationId;

    @Indexed
    private String doctorId;

    private String patientId;
    private String appointmentId;
    private String meetingUrl;

    @Builder.Default
    private ConsultationStatus status = ConsultationStatus.SCHEDULED;

    private Instant scheduledAt;
    private Instant startedAt;
    private Instant endedAt;
    private String notes;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
