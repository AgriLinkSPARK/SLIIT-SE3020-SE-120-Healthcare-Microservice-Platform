package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "patient_feedback")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientFeedback {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field
    private FeedbackType type;

    @Field
    private String title;

    @Field
    private String description;

    @Field
    private FeedbackStatus status;

    @Field("submitted_at")
    private LocalDateTime submittedAt;

    public enum FeedbackType {
        BUG, FEEDBACK, SUGGESTION
    }

    public enum FeedbackStatus {
        OPEN, IN_PROGRESS, RESOLVED
    }
}
