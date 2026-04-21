package com.sliit.healthcare.doctor.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctor_availability")
public class AvailabilitySlot {

    @Id
    private String id;

    @Indexed
    private String doctorId;

    private Instant startTime;
    private Instant endTime;
    private LocationType locationType;
    private SlotStatus status;
    private Integer onlineCapacity;
    private Integer physicalCapacity;
    private String specialization;
    private BigDecimal consultationFee;
    private String notes;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
