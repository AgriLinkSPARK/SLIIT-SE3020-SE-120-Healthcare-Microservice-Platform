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
import java.util.ArrayList;
import java.util.List;

@Document(collection = "prescriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("doctor_id")
    private String doctorId;

    @Field("doctor_name")
    private String doctorName;

    @Field("appointment_id")
    private String appointmentId;

    @Field("diagnosis")
    private String diagnosis;

    @Field("notes")
    private String notes;

    @Field("prescription_date")
    private LocalDate prescriptionDate;

    @Field("valid_until")
    private LocalDate validUntil;

    @Field("medications")
    @Builder.Default
    private List<PrescribedMedication> medications = new ArrayList<>();

    @Field("created_at")
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescribedMedication {
        @Field("medication_name")
        private String medicationName;

        @Field("dosage")
        private String dosage;

        @Field("frequency")
        private String frequency;

        @Field("duration")
        private String duration;

        @Field("instructions")
        private String instructions;
    }
}
