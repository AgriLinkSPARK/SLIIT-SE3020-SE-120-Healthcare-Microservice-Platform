package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.SecureMessageRequestDto;
import com.sliit.healthcare.patient.dto.SecureMessageResponseDto;
import com.sliit.healthcare.patient.service.SecureMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/messages")
@RequiredArgsConstructor
public class SecureMessageController {

    private final SecureMessageService secureMessageService;

    @PostMapping
    public ResponseEntity<ApiResponse<SecureMessageResponseDto>> sendMessage(
            @PathVariable String patientId,
            @Valid @RequestBody SecureMessageRequestDto requestDto) {
        SecureMessageResponseDto message = secureMessageService.sendMessage(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Message sent successfully", message));
    }

    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<List<SecureMessageResponseDto>>> getInbox(@PathVariable String patientId) {
        List<SecureMessageResponseDto> messages = secureMessageService.getInbox(patientId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/thread/{threadId}")
    public ResponseEntity<ApiResponse<List<SecureMessageResponseDto>>> getThread(@PathVariable String threadId) {
        List<SecureMessageResponseDto> messages = secureMessageService.getThread(threadId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String messageId) {
        secureMessageService.markAsRead(messageId);
        return ResponseEntity.ok(ApiResponse.success("Message marked as read", null));
    }
}
