package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.InsuranceInfoRequestDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.model.InsuranceInfo;
import com.sliit.healthcare.patient.repository.InsuranceInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private final InsuranceInfoRepository insuranceInfoRepository;

    @Transactional(readOnly = true)
    public List<InsuranceInfo> getInsurance(String patientId) {
        return insuranceInfoRepository.findByPatientId(patientId);
    }

    @Transactional
    public InsuranceInfo addInsurance(String patientId, InsuranceInfoRequestDto requestDto) {
        InsuranceInfo insurance = InsuranceInfo.builder()
                .patientId(patientId)
                .provider(requestDto.getProvider())
                .policyNumber(requestDto.getPolicyNumber())
                .groupNumber(requestDto.getGroupNumber())
                .coverageStartDate(requestDto.getCoverageStartDate())
                .coverageEndDate(requestDto.getCoverageEndDate())
                .isPrimary(requestDto.getIsPrimary() != null ? requestDto.getIsPrimary() : false)
                .build();
        return insuranceInfoRepository.save(insurance);
    }

    @Transactional
    public InsuranceInfo updateInsurance(String insuranceId, InsuranceInfoRequestDto requestDto) {
        InsuranceInfo insurance = insuranceInfoRepository.findById(insuranceId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance", "id", insuranceId));
        
        insurance.setProvider(requestDto.getProvider());
        insurance.setPolicyNumber(requestDto.getPolicyNumber());
        insurance.setGroupNumber(requestDto.getGroupNumber());
        insurance.setCoverageStartDate(requestDto.getCoverageStartDate());
        insurance.setCoverageEndDate(requestDto.getCoverageEndDate());
        insurance.setIsPrimary(requestDto.getIsPrimary());
        
        return insuranceInfoRepository.save(insurance);
    }
}
