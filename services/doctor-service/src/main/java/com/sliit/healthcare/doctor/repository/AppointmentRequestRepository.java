package com.sliit.healthcare.doctor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.doctor.model.AppointmentRequest;

public interface AppointmentRequestRepository extends MongoRepository<AppointmentRequest, String> {

    Optional<AppointmentRequest> findByAppointmentId(String appointmentId);

    List<AppointmentRequest> findByDoctorIdOrderByRequestedAtDesc(String doctorId);
}
