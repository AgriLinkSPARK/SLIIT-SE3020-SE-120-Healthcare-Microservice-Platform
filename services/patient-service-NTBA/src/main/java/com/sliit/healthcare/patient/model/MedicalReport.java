package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medical_reports")
public class MedicalReport {

    @Field("report_id")
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("title")
    private String title;

    @Field("description")
    private String description;

    @Field("file_name")
    private String fileName;

    @Field("file_type")
    private String fileType;

    @Field("file_size")
    private Long fileSize;

    @Field("file_url")
    private String fileUrl;

    @Field("storage_path")
    private String storagePath;

    @Field("uploaded_by")
    private String uploadedBy;

    @Field("uploaded_at")
    private java.time.Instant uploadedAt;
}
