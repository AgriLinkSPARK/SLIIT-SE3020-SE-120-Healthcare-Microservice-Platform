package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.model.EducationalResource;
import com.sliit.healthcare.patient.model.MedicalTerm;
import com.sliit.healthcare.patient.service.EducationalResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/education")
@RequiredArgsConstructor
public class EducationalResourceController {

    private final EducationalResourceService educationalResourceService;

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<EducationalResource>>> searchResources(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String condition) {
        
        List<EducationalResource> resources;
        if (keyword != null && !keyword.isEmpty()) {
            resources = educationalResourceService.search(keyword);
        } else if (condition != null && !condition.isEmpty()) {
            resources = educationalResourceService.findByCondition(condition);
        } else if (type != null && !type.isEmpty()) {
            resources = educationalResourceService.findByType(type);
        } else {
            resources = List.of();
        }
        
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @GetMapping("/dictionary/{term}")
    public ResponseEntity<ApiResponse<MedicalTerm>> getMedicalTerm(@PathVariable String term) {
        Optional<MedicalTerm> medicalTerm = educationalResourceService.getMedicalTerm(term);
        return medicalTerm.map(t -> ResponseEntity.ok(ApiResponse.success(t)))
                .orElse(ResponseEntity.ok(ApiResponse.error("Term not found")));
    }

    @GetMapping("/videos")
    public ResponseEntity<ApiResponse<List<EducationalResource>>> getVideos() {
        List<EducationalResource> videos = educationalResourceService.findVideos();
        return ResponseEntity.ok(ApiResponse.success(videos));
    }

    @GetMapping("/articles")
    public ResponseEntity<ApiResponse<List<EducationalResource>>> getArticles() {
        List<EducationalResource> articles = educationalResourceService.findArticles();
        return ResponseEntity.ok(ApiResponse.success(articles));
    }
}
