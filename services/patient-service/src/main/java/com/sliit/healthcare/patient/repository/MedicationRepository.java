package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.Medication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends MongoRepository<Medication, String> {
    List<Medication> findByPatientId(String patientId);
    List<Medication> findByPatientIdAndIsActive(String patientId, Boolean isActive);
}
