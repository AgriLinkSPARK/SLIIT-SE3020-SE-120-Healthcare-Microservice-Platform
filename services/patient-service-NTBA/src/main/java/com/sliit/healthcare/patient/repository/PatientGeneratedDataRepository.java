package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.PatientGeneratedData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientGeneratedDataRepository extends MongoRepository<PatientGeneratedData, String> {
    List<PatientGeneratedData> findByPatientId(String patientId);
    List<PatientGeneratedData> findByPatientIdAndDataType(String patientId, PatientGeneratedData.DataType dataType);
}
