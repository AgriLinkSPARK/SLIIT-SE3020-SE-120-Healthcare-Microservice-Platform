package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.SecureMessageRequestDto;
import com.sliit.healthcare.patient.dto.SecureMessageResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.SecureMessage;
import com.sliit.healthcare.patient.repository.SecureMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SecureMessageService {

    private final SecureMessageRepository secureMessageRepository;
    private final MessageThreadService messageThreadService;

    @Transactional
    public SecureMessageResponseDto sendMessage(SecureMessageRequestDto requestDto) {
        if (requestDto.getThreadId() == null) {
            String threadId = messageThreadService.createThread(
                    requestDto.getRecipientId(),
                    requestDto.getSubject()
            );
            requestDto.setThreadId(threadId);
        }

        SecureMessage message = SecureMessage.builder()
                .senderId(requestDto.getSenderId())
                .senderRole(SecureMessage.SenderRole.valueOf(requestDto.getSenderRole()))
                .recipientId(requestDto.getRecipientId())
                .recipientRole(SecureMessage.SenderRole.valueOf(requestDto.getRecipientRole()))
                .subject(requestDto.getSubject())
                .body(requestDto.getBody())
                .isRead(false)
                .threadId(requestDto.getThreadId())
                .build();
        
        SecureMessage savedMessage = secureMessageRepository.save(message);
        messageThreadService.updateLastMessageAt(requestDto.getThreadId());
        
        return mapToResponseDto(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<SecureMessageResponseDto> getInbox(String patientId) {
        return secureMessageRepository.findByRecipientIdAndRecipientRole(patientId, SecureMessage.SenderRole.PATIENT).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String messageId) {
        SecureMessage message = secureMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));
        message.setIsRead(true);
        secureMessageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<SecureMessageResponseDto> getThread(String threadId) {
        return secureMessageRepository.findByThreadId(threadId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SecureMessageResponseDto> routeToStaff(String role) {
        try {
            SecureMessage.SenderRole senderRole = SecureMessage.SenderRole.valueOf(role.toUpperCase());
            return secureMessageRepository.findByRecipientIdAndRecipientRole("0", senderRole).stream()
                    .map(this::mapToResponseDto)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Role not found: " + role);
        }
    }

    private SecureMessageResponseDto mapToResponseDto(SecureMessage message) {
        return SecureMessageResponseDto.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderRole(message.getSenderRole().name())
                .recipientId(message.getRecipientId())
                .recipientRole(message.getRecipientRole().name())
                .subject(message.getSubject())
                .body(message.getBody())
                .isRead(message.getIsRead())
                .threadId(message.getThreadId())
                .sentAt(message.getSentAt())
                .build();
    }
}
