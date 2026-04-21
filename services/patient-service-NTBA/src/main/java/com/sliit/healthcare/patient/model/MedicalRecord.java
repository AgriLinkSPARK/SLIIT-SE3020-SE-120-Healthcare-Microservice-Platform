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

@Document(collection = "medical_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("record_type")
    private RecordType recordType;

    @Field
    private String title;

    @Field
    private String description;

    @Field("file_url")
    private String fileUrl;

    @Field("record_date")
    private LocalDate recordDate;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("reports")
    @Builder.Default
    private List<MedicalReport> reports = new ArrayList<>();

    public enum RecordType {
        LAB, IMAGING, TEST
    }
}
