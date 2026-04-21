package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.EducationalResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationalResourceRepository extends MongoRepository<EducationalResource, String> {
    List<EducationalResource> findByTitleContainingIgnoreCase(String keyword);
    List<EducationalResource> findByType(EducationalResource.ResourceType type);
}
