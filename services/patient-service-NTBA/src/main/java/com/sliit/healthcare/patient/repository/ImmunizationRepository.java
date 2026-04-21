package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.Immunization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ImmunizationRepository extends MongoRepository<Immunization, String> {
    List<Immunization> findByPatientId(String patientId);
    List<Immunization> findByPatientIdAndNextDueDateAfter(String patientId, LocalDate date);
}
