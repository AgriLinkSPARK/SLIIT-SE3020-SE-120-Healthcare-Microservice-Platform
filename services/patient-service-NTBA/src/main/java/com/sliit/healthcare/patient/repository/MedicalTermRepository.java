package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.MedicalTerm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalTermRepository extends MongoRepository<MedicalTerm, String> {
    Optional<MedicalTerm> findByTermIgnoreCase(String term);
}
