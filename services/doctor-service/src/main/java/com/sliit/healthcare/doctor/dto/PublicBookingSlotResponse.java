package com.sliit.healthcare.doctor.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.sliit.healthcare.doctor.model.LocationType;
import com.sliit.healthcare.doctor.model.SlotStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicBookingSlotResponse {

    private String slotId;
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
}