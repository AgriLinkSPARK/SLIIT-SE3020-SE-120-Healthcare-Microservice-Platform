package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.ProxyAccessRequestDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.ProxyAccess;
import com.sliit.healthcare.patient.repository.ProxyAccessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProxyAccessService {

    private final ProxyAccessRepository proxyAccessRepository;

    @Transactional
    public ProxyAccess grantAccess(String patientId, ProxyAccessRequestDto requestDto) {
        ProxyAccess proxyAccess = ProxyAccess.builder()
                .patientId(patientId)
                .proxyUserId(requestDto.getProxyUserId())
                .relationship(ProxyAccess.Relationship.valueOf(requestDto.getRelationship()))
                .permissions(requestDto.getPermissions())
                .isActive(true)
                .build();
        return proxyAccessRepository.save(proxyAccess);
    }

    @Transactional
    public void revokeAccess(String proxyId) {
        ProxyAccess proxyAccess = proxyAccessRepository.findById(proxyId)
                .orElseThrow(() -> new ResourceNotFoundException("Proxy Access", "id", proxyId));
        proxyAccess.setIsActive(false);
        proxyAccessRepository.save(proxyAccess);
    }

    @Transactional(readOnly = true)
    public List<ProxyAccess> getProxies(String patientId) {
        return proxyAccessRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public List<ProxyAccess> getAccessiblePatients(Long proxyUserId) {
        return proxyAccessRepository.findByProxyUserIdAndIsActive(proxyUserId, true);
    }
}
