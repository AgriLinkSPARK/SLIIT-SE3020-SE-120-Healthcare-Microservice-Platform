package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "video_consultations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoConsultation {

    @Id
    private String id;

    @Field("appointment_id")
    private String appointmentId;

    @Field("patient_id")
    private String patientId;

    @Field("doctor_id")
    private String doctorId;

    @Field("meeting_link")
    private String meetingLink;

    @Field("meeting_id")
    private String meetingId;

    @Field("passcode")
    private String passcode;

    @Field("status")
    @Builder.Default
    private ConsultationStatus status = ConsultationStatus.SCHEDULED;

    @Field("scheduled_start")
    private LocalDateTime scheduledStart;

    @Field("scheduled_end")
    private LocalDateTime scheduledEnd;

    @Field("actual_start")
    private LocalDateTime actualStart;

    @Field("actual_end")
    private LocalDateTime actualEnd;

    @Field("recording_url")
    private String recordingUrl;

    @Field("notes")
    private String notes;

    @Field("created_at")
    private LocalDateTime createdAt;

    public enum ConsultationStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    }
}
