package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.ProxyAccess;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProxyAccessRepository extends MongoRepository<ProxyAccess, String> {
    List<ProxyAccess> findByPatientId(String patientId);
    List<ProxyAccess> findByProxyUserId(Long proxyUserId);
    List<ProxyAccess> findByProxyUserIdAndIsActive(Long proxyUserId, Boolean isActive);
}
