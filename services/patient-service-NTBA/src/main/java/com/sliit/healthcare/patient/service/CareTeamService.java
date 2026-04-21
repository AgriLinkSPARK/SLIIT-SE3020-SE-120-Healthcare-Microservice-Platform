package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.CareTeamMember;
import com.sliit.healthcare.patient.repository.CareTeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareTeamService {

    private final CareTeamMemberRepository careTeamMemberRepository;

    @Transactional(readOnly = true)
    public List<CareTeamMember> getCareTeam(String patientId) {
        return careTeamMemberRepository.findByPatientId(patientId);
    }

    @Transactional
    public CareTeamMember addMember(String patientId, Long providerId, String providerName, String role, 
                                     String photoUrl, String specialty, String contactInfo) {
        CareTeamMember member = CareTeamMember.builder()
                .patientId(patientId)
                .providerId(providerId)
                .providerName(providerName)
                .role(role)
                .photoUrl(photoUrl)
                .specialty(specialty)
                .contactInfo(contactInfo)
                .build();
        return careTeamMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(String memberId) {
        if (!careTeamMemberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("Care Team Member", "id", memberId);
        }
        careTeamMemberRepository.deleteById(memberId);
    }
}
