package com.sliit.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecureMessageResponseDto {
    private String id;
    private String senderId;
    private String senderRole;
    private String recipientId;
    private String recipientRole;
    private String subject;
    private String body;
    private Boolean isRead;
    private String threadId;
    private LocalDateTime sentAt;
}
