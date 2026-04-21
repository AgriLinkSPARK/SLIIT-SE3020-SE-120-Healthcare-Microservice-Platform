package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(String patientId);

    List<Appointment> findByPatientIdAndStatusOrderByAppointmentDateDesc(String patientId, Appointment.AppointmentStatus status);

    List<Appointment> findByPatientIdAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAsc(String patientId, LocalDate date);
}
