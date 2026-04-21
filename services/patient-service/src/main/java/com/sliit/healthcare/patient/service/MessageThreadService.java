package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.MessageThread;
import com.sliit.healthcare.patient.repository.MessageThreadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageThreadService {

    private final MessageThreadRepository messageThreadRepository;

    @Transactional
    public String createThread(String patientId, String subject) {
        List<String> participants = new ArrayList<>();
        participants.add("PATIENT_" + patientId);
        
        MessageThread thread = MessageThread.builder()
                .patientId(patientId)
                .subject(subject)
                .participants(participants)
                .build();
        
        MessageThread savedThread = messageThreadRepository.save(thread);
        return savedThread.getId();
    }

    @Transactional(readOnly = true)
    public List<MessageThread> getThreadsByPatientId(String patientId) {
        return messageThreadRepository.findByPatientId(patientId);
    }

    @Transactional
    public void updateLastMessageAt(String threadId) {
        MessageThread thread = messageThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResourceNotFoundException("Thread", "id", threadId));
        thread.setLastMessageAt(LocalDateTime.now());
        messageThreadRepository.save(thread);
    }
}
