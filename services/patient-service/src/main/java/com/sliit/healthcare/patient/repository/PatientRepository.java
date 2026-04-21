package com.sliit.healthcare.patient.repository;
import com.sliit.healthcare.patient.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
