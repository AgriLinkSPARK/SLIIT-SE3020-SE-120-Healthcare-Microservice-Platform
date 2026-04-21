package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "patient_generated_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientGeneratedData {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("data_type")
    private DataType dataType;

    @Field
    private String dataValue;

    @Field
    private String unit;

    @Field
    private String notes;

    @Field("recorded_at")
    private LocalDateTime recordedAt;

    public enum DataType {
        SYMPTOM, REPORT, MEASUREMENT
    }
}
