package com.sliit.healthcare.doctor.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicBookingDoctorResponse {

    private String doctorId;
    private String fullName;
    private String specialization;
    private String qualifications;
    private String bio;
    private int yearsOfExperience;
    private BigDecimal consultationFee;
    private String phone;
    private boolean verified;
    private List<PublicBookingSlotResponse> availabilitySlots;
}