package com.sliit.healthcare.doctor.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.sliit.healthcare.doctor.model.LocationType;
import com.sliit.healthcare.doctor.model.SlotStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityRequest {

    @NotNull
    private Instant startTime;

    @NotNull
    private Instant endTime;

    @NotNull
    private LocationType locationType;

    @NotNull
    @Min(0)
    private Integer onlineCapacity;

    @NotNull
    @Min(0)
    private Integer physicalCapacity;

    private String specialization;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal consultationFee;

    private SlotStatus status;

    private String notes;
}
