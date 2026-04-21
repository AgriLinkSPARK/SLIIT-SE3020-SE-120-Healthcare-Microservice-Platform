package com.sliit.healthcare.doctor.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.healthcare.doctor.model.PatientReport;

public interface PatientReportRepository extends MongoRepository<PatientReport, String> {

    List<PatientReport> findByPatientIdOrderByUploadedAtDesc(String patientId);
}
