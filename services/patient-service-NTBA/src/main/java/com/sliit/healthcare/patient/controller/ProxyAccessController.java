package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.ProxyAccessRequestDto;
import com.sliit.healthcare.patient.model.ProxyAccess;
import com.sliit.healthcare.patient.service.ProxyAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/proxy-access")
@RequiredArgsConstructor
public class ProxyAccessController {

    private final ProxyAccessService proxyAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProxyAccess>>> getProxies(@PathVariable String patientId) {
        List<ProxyAccess> proxies = proxyAccessService.getProxies(patientId);
        return ResponseEntity.ok(ApiResponse.success(proxies));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProxyAccess>> grantAccess(
            @PathVariable String patientId,
            @Valid @RequestBody ProxyAccessRequestDto requestDto) {
        ProxyAccess proxyAccess = proxyAccessService.grantAccess(patientId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Access granted successfully", proxyAccess));
    }

    @DeleteMapping("/{proxyId}")
    public ResponseEntity<ApiResponse<Void>> revokeAccess(@PathVariable String proxyId) {
        proxyAccessService.revokeAccess(proxyId);
        return ResponseEntity.ok(ApiResponse.success("Access revoked successfully", null));
    }
}
