package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.EducationalResource;
import com.sliit.healthcare.patient.model.MedicalTerm;
import com.sliit.healthcare.patient.repository.EducationalResourceRepository;
import com.sliit.healthcare.patient.repository.MedicalTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EducationalResourceService {

    private final EducationalResourceRepository educationalResourceRepository;
    private final MedicalTermRepository medicalTermRepository;

    @Transactional(readOnly = true)
    public List<EducationalResource> search(String keyword) {
        return educationalResourceRepository.findByTitleContainingIgnoreCase(keyword);
    }

    @Transactional(readOnly = true)
    public List<EducationalResource> findByCondition(String condition) {
        // This is a simplified implementation - in production, you'd use a more sophisticated query
        return educationalResourceRepository.findAll().stream()
                .filter(r -> r.getRelatedConditions() != null && 
                        r.getRelatedConditions().stream().anyMatch(c -> c.equalsIgnoreCase(condition)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EducationalResource> findByType(String type) {
        try {
            EducationalResource.ResourceType resourceType = EducationalResource.ResourceType.valueOf(type.toUpperCase());
            return educationalResourceRepository.findByType(resourceType);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Resource type not found: " + type);
        }
    }

    @Transactional(readOnly = true)
    public Optional<MedicalTerm> getMedicalTerm(String term) {
        return medicalTermRepository.findByTermIgnoreCase(term);
    }

    @Transactional(readOnly = true)
    public List<EducationalResource> findVideos() {
        return educationalResourceRepository.findByType(EducationalResource.ResourceType.VIDEO);
    }

    @Transactional(readOnly = true)
    public List<EducationalResource> findArticles() {
        return educationalResourceRepository.findByType(EducationalResource.ResourceType.ARTICLE);
    }
}
