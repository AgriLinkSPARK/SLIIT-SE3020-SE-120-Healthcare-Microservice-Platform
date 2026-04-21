package com.sliit.healthcare.patient.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "bills")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    private String id;

    @Field("patient_id")
    private String patientId;

    @Field
    private String description;

    @Field
    private BigDecimal amount;

    @Field("due_date")
    private LocalDate dueDate;

    @Field
    private BillStatus status;

    @Field("paid_at")
    private LocalDateTime paidAt;

    @Field("payment_method")
    private String paymentMethod;

    @Field("created_at")
    private LocalDateTime createdAt;

    public enum BillStatus {
        PAID, PENDING, OVERDUE
    }
}
