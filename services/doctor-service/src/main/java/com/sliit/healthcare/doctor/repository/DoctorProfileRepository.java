package com.sliit.healthcare.doctor.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.doctor.model.DoctorProfile;

public interface DoctorProfileRepository extends MongoRepository<DoctorProfile, String> {

    Optional<DoctorProfile> findByDoctorId(String doctorId);
}
