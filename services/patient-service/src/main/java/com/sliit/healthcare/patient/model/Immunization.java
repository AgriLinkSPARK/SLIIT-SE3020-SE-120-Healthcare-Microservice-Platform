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

@Document(collection = "immunizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Immunization {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("vaccine_name")
    private String vaccineName;

    @Field("administered_date")
    private LocalDate administeredDate;

    @Field("next_due_date")
    private LocalDate nextDueDate;

    @Field("administered_by")
    private String administeredBy;

    @Field("batch_number")
    private String batchNumber;

    @Field("created_at")
    private LocalDateTime createdAt;
}
