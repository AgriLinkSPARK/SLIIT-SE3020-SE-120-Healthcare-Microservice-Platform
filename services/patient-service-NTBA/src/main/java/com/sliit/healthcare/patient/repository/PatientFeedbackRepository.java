package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.PatientFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientFeedbackRepository extends MongoRepository<PatientFeedback, String> {
    List<PatientFeedback> findByPatientId(String patientId);
}
