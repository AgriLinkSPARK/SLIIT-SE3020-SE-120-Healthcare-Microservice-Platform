package com.sliit.healthcare.telemedicine.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sliit.healthcare.telemedicine.model.VideoSession;
import com.sliit.healthcare.telemedicine.model.VideoSession.SessionStatus;

@Repository
public interface VideoSessionRepository extends MongoRepository<VideoSession, String> {
    
    Optional<VideoSession> findByAppointmentId(String appointmentId);
    
    List<VideoSession> findByPatientIdAndStatus(String patientId, SessionStatus status);
    
    List<VideoSession> findByDoctorIdAndStatus(String doctorId, SessionStatus status);
    
    List<VideoSession> findByStatusAndScheduledStartTimeBetween(
        SessionStatus status,
        Instant start,
        Instant end
    );
    
    List<VideoSession> findByPatientIdOrderByCreatedAtDesc(String patientId);
    
    List<VideoSession> findByDoctorIdOrderByCreatedAtDesc(String doctorId);
    
    Optional<VideoSession> findByJitsiRoomId(String jitsiRoomId);
}
