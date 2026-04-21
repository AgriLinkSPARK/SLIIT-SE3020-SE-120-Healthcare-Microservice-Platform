package com.sliit.healthcare.patient.dto;

import com.sliit.healthcare.patient.model.VideoConsultation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoConsultationResponseDto {

    private String id;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String meetingLink;
    private String meetingId;
    private String passcode;
    private VideoConsultation.ConsultationStatus status;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
    private String recordingUrl;
    private String notes;
    private LocalDateTime createdAt;
}
