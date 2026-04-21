package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "care_team_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareTeamMember {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("provider_id")
    private Long providerId;

    @Field("provider_name")
    private String providerName;

    @Field
    private String role;

    @Field("photo_url")
    private String photoUrl;

    @Field
    private String specialty;

    @Field("contact_info")
    private String contactInfo;

    @Field("created_at")
    private LocalDateTime createdAt;
}
