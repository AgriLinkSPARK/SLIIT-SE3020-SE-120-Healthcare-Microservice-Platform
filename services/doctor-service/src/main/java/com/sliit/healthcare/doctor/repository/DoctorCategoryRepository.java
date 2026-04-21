package com.sliit.healthcare.doctor.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.doctor.model.DoctorCategory;

public interface DoctorCategoryRepository extends MongoRepository<DoctorCategory, String> {
    List<DoctorCategory> findAllByOrderByDisplayOrderAsc();
}
