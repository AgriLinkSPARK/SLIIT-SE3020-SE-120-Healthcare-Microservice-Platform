package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.MessageThread;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageThreadRepository extends MongoRepository<MessageThread, String> {
    List<MessageThread> findByPatientId(String patientId);
}
