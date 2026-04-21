package com.sliit.healthcare.doctor.model;

import java.time.Instant;
import java.util.List;

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
@Document(collection = "digital_prescriptions")
public class DigitalPrescription {

    @Id
    private String id;

    @Indexed
    private String prescriptionId;

    @Indexed
    private String doctorId;

    private String patientId;
    private String consultationId;
    private String diagnosis;
    private List<String> medications;
    private String additionalNotes;

    @Builder.Default
    private Instant issuedAt = Instant.now();
}
