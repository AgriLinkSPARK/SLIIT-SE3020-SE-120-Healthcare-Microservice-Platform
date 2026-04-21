package com.sliit.healthcare.doctor.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.doctor.model.DigitalPrescription;

public interface DigitalPrescriptionRepository extends MongoRepository<DigitalPrescription, String> {

    List<DigitalPrescription> findByDoctorIdOrderByIssuedAtDesc(String doctorId);

    List<DigitalPrescription> findByPatientIdOrderByIssuedAtDesc(String patientId);
}
