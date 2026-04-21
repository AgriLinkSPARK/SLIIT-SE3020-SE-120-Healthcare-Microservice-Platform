package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.Allergy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends MongoRepository<Allergy, String> {
    List<Allergy> findByPatientId(String patientId);
}
