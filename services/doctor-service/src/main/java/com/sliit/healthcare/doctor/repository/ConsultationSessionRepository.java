package com.sliit.healthcare.doctor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.doctor.model.ConsultationSession;

public interface ConsultationSessionRepository extends MongoRepository<ConsultationSession, String> {

    Optional<ConsultationSession> findByConsultationId(String consultationId);

    List<ConsultationSession> findByDoctorIdOrderByCreatedAtDesc(String doctorId);
}
