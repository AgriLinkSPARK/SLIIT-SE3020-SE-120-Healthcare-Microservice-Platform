package com.sliit.healthcare.payment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.sliit.healthcare.payment.entity.Payment;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByConsultationId(String consultationId);

    List<Payment> findByPatientId(String patientId);

    List<Payment> findByDoctorId(String doctorId);

    @Query("{ 'doctorId': ?0, 'status': ?1 }")
    List<Payment> findByDoctorIdAndStatus(String doctorId, Payment.PaymentStatus status);

    @Query("{ 'consultationId': ?0, 'status': ?1 }")
    Optional<Payment> findByConsultationIdAndStatus(String consultationId, Payment.PaymentStatus status);

    @Query("{ 'status': ?0, 'createdAt': { $gte: ?1, $lte: ?2 } }")
    List<Payment> findByStatusAndDateRange(Payment.PaymentStatus status, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{ 'patientId': ?0, 'status': ?1 }")
    List<Payment> findByPatientIdAndStatus(String patientId, Payment.PaymentStatus status);

    @Query("{ 'status': ?0 }")
    List<Payment> findByStatus(Payment.PaymentStatus status);

    @Query("{ 'refundRequested': true, 'status': { $ne: 'REFUNDED' } }")
    List<Payment> findPendingRefunds();
}
