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

@Document(collection = "medications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medication {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("medication_name")
    private String medicationName;

    @Field
    private String dosage;

    @Field
    private String frequency;

    @Field("side_effects")
    private String sideEffects;

    @Field("prescribed_by")
    private String prescribedBy;

    @Field("start_date")
    private LocalDate startDate;

    @Field("end_date")
    private LocalDate endDate;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Field("created_at")
    private LocalDateTime createdAt;
}
