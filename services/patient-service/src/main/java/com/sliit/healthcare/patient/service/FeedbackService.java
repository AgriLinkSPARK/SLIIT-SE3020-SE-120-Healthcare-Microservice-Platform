package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.FeedbackRequestDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.PatientFeedback;
import com.sliit.healthcare.patient.repository.PatientFeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final PatientFeedbackRepository patientFeedbackRepository;

    @Transactional
    public PatientFeedback submitFeedback(String patientId, FeedbackRequestDto requestDto) {
        PatientFeedback feedback = PatientFeedback.builder()
                .patientId(patientId)
                .type(PatientFeedback.FeedbackType.valueOf(requestDto.getType()))
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .status(PatientFeedback.FeedbackStatus.OPEN)
                .build();
        return patientFeedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<PatientFeedback> getFeedback(String patientId) {
        return patientFeedbackRepository.findByPatientId(patientId);
    }

    @Transactional
    public PatientFeedback updateStatus(String feedbackId, String status) {
        PatientFeedback feedback = patientFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback", "id", feedbackId));
        feedback.setStatus(PatientFeedback.FeedbackStatus.valueOf(status));
        return patientFeedbackRepository.save(feedback);
    }
}
