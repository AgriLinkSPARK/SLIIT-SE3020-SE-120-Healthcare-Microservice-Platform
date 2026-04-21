package com.sliit.healthcare.doctor.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.doctor.model.AvailabilitySlot;

public interface AvailabilitySlotRepository extends MongoRepository<AvailabilitySlot, String> {

    List<AvailabilitySlot> findByDoctorIdOrderByStartTimeAsc(String doctorId);
}
