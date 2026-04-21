package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "allergies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Allergy {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("allergy_name")
    private String allergyName;

    @Field
    private Severity severity;

    @Field
    private String reaction;

    @Field
    private String notes;

    @Field("created_at")
    private LocalDateTime createdAt;

    public enum Severity {
        MILD, MODERATE, SEVERE
    }
}
