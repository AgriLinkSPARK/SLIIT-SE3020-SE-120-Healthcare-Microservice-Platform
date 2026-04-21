package com.sliit.healthcare.doctor.model;

import java.math.BigDecimal;
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
@Document(collection = "doctor_profiles")
public class DoctorProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String doctorId;

    private String fullName;
    private String email;
    private String specialization;
    private String qualifications;
    private String bio;
    private int yearsOfExperience;
    private BigDecimal consultationFee;
    private String phone;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
