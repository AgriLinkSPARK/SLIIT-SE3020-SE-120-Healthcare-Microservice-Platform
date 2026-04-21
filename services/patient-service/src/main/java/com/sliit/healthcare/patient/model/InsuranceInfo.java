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

@Document(collection = "insurance_info")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceInfo {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field
    private String provider;

    @Field("policy_number")
    private String policyNumber;

    @Field("group_number")
    private String groupNumber;

    @Field("coverage_start_date")
    private LocalDate coverageStartDate;

    @Field("coverage_end_date")
    private LocalDate coverageEndDate;

    @Field("is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Field("created_at")
    private LocalDateTime createdAt;
}
