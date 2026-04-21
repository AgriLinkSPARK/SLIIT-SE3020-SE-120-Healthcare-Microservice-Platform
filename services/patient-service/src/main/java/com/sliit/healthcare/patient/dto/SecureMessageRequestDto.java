package com.sliit.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecureMessageRequestDto {
    @NotNull(message = "Sender ID is required")
    private String senderId;

    @NotBlank(message = "Sender role is required")
    private String senderRole;

    @NotNull(message = "Recipient ID is required")
    private String recipientId;

    @NotBlank(message = "Recipient role is required")
    private String recipientRole;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    private String threadId;
}
