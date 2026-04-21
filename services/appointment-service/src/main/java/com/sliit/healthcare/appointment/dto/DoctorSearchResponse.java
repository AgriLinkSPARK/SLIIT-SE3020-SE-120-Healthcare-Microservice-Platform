package com.sliit.healthcare.appointment.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorSearchResponse {
    private String doctorId;
    private String doctorName;
    private String specialty;
    private String qualifications;
    private BigDecimal consultationFee;
    private boolean verified;
}
