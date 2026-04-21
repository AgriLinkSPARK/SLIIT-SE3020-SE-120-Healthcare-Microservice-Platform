package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("doctor_id")
    private String doctorId;

    @Field("doctor_name")
    private String doctorName;

    @Field("appointment_date")
    private LocalDate appointmentDate;

    @Field("appointment_time")
    private LocalTime appointmentTime;

    @Field("reason")
    private String reason;

    @Field("notes")
    private String notes;

    @Field("status")
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    public enum AppointmentStatus {
        SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    }
}
