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
@Document(collection = "patient_reports")
public class PatientReport {

    @Id
    private String id;

    @Indexed
    private String reportId;

    @Indexed
    private String patientId;

    private String uploadedBy;
    private String title;
    private String fileUrl;
    private String notes;

    @Builder.Default
    private Instant uploadedAt = Instant.now();
}
