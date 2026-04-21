package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.Diagnosis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosisRepository extends MongoRepository<Diagnosis, String> {
    List<Diagnosis> findByPatientId(String patientId);
    List<Diagnosis> findByPatientIdOrderByDiagnosedDateDesc(String patientId);
}
