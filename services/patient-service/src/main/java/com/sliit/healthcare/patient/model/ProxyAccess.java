package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "proxy_access")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProxyAccess {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field("proxy_user_id")
    private Long proxyUserId;

    @Field
    private Relationship relationship;

    @Field
    private List<String> permissions;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Field("granted_at")
    private LocalDateTime grantedAt;

    public enum Relationship {
        PARENT, GUARDIAN, CAREGIVER
    }
}
