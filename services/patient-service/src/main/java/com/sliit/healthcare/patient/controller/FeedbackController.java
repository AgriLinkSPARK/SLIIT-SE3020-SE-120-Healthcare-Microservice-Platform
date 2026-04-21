package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.FeedbackRequestDto;
import com.sliit.healthcare.patient.model.PatientFeedback;
import com.sliit.healthcare.patient.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<ApiResponse<PatientFeedback>> submitFeedback(
            @PathVariable String patientId,
            @Valid @RequestBody FeedbackRequestDto requestDto) {
        PatientFeedback feedback = feedbackService.submitFeedback(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Feedback submitted successfully", feedback));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientFeedback>>> getFeedback(@PathVariable String patientId) {
        List<PatientFeedback> feedback = feedbackService.getFeedback(patientId);
        return ResponseEntity.ok(ApiResponse.success(feedback));
    }
}
