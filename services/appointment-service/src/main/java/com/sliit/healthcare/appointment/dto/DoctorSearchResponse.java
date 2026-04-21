package com.sliit.healthcare.appointment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorSearchResponse {
    private String doctorName;
    private String specialty;
}
