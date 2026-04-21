package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.InsuranceInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsuranceInfoRepository extends MongoRepository<InsuranceInfo, String> {
    List<InsuranceInfo> findByPatientId(String patientId);
}
