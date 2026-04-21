package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.CareTeamMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareTeamMemberRepository extends MongoRepository<CareTeamMember, String> {
    List<CareTeamMember> findByPatientId(String patientId);
}
