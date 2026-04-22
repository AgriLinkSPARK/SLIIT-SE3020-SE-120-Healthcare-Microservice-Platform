package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    @Field("user_id")
    private String userId;

    @Field("first_name")
    private String firstName;

    @Field("last_name")
    private String lastName;

    @Field
    private String email;

    @Field
    private String password;

    @Field
    private String phone;

    @Field("date_of_birth")
    private LocalDate dateOfBirth;

    @Field
    private String gender;

    @Field
    private String address;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("reports")
    @Builder.Default
    private List<MedicalReport> reports = new ArrayList<>();
}
