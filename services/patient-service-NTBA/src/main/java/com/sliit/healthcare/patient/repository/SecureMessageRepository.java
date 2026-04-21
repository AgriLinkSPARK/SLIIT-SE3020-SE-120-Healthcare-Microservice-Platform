package com.sliit.healthcare.patient.repository;

import com.sliit.healthcare.patient.model.SecureMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecureMessageRepository extends MongoRepository<SecureMessage, String> {
    List<SecureMessage> findByRecipientIdAndRecipientRole(String recipientId, SecureMessage.SenderRole recipientRole);
    List<SecureMessage> findByThreadId(String threadId);
}
