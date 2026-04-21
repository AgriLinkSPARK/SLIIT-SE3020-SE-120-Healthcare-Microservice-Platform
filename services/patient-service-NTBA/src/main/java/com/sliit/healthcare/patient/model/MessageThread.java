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

@Document(collection = "message_threads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageThread {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field
    private String subject;

    @Field("last_message_at")
    private LocalDateTime lastMessageAt;

    @Field
    private List<String> participants;

    @Field("created_at")
    private LocalDateTime createdAt;
}
