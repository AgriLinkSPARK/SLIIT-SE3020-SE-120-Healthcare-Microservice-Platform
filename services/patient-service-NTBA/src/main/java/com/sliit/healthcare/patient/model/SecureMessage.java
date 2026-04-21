package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "secure_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecureMessage {

    @Id
    private String id;

    @Field("sender_id")
    private String senderId;

    @Field("sender_role")
    private SenderRole senderRole;

    @Field("recipient_id")
    private String recipientId;

    @Field("recipient_role")
    private SenderRole recipientRole;

    @Field
    private String subject;

    @Field
    private String body;

    @Field("is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Field("thread_id")
    private String threadId;

    @Field("sent_at")
    private LocalDateTime sentAt;

    public enum SenderRole {
        PATIENT, DOCTOR, NURSE, BILLING
    }
}
