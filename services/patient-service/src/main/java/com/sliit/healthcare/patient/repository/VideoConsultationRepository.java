package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.VideoConsultation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoConsultationRepository extends MongoRepository<VideoConsultation, String> {

    List<VideoConsultation> findByPatientIdOrderByScheduledStartDesc(String patientId);

    Optional<VideoConsultation> findByAppointmentId(String appointmentId);

    List<VideoConsultation> findByPatientIdAndStatus(String patientId, VideoConsultation.ConsultationStatus status);
}
