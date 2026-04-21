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

@Document(collection = "diagnoses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Diagnosis {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field
    private String condition;

    @Field("plain_language_description")
    private String plainLanguageDescription;

    @Field("diagnosed_date")
    private LocalDate diagnosedDate;

    @Field
    private DiagnosisStatus status;

    @Field("created_at")
    private LocalDateTime createdAt;

    public enum DiagnosisStatus {
        ACTIVE, RESOLVED
    }
}
