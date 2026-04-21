package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    List<MedicalRecord> findByPatientId(String patientId);
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(String patientId);
}
