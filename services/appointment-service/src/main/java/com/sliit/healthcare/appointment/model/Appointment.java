package com.sliit.healthcare.appointment.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

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
@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    @Indexed
    private String patientId;

    @Indexed
    private String doctorId;

    @Indexed
    private String slotId;

    private String doctorName;

    @Indexed
    private String specialty;

    private AppointmentType type;

    @Indexed
    private AppointmentStatus status;

    private LocalDateTime appointmentDateTime;

    private String notes;

    private BigDecimal fee;

    private Instant createdAt;

    private Instant updatedAt;

    public enum AppointmentType {
        ONLINE_VIDEO,
        PHYSICAL_VISIT
    }

    public enum AppointmentStatus {
        BOOKED,
        CONFIRMED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
