package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {

    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(String patientId);

    List<Prescription> findByPatientIdAndDoctorIdOrderByPrescriptionDateDesc(String patientId, String doctorId);

    List<Prescription> findByAppointmentId(String appointmentId);
}
