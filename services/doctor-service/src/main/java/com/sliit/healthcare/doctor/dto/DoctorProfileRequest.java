package com.sliit.healthcare.doctor.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DoctorProfileRequest {

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String specialization;

    @NotBlank
    private String qualifications;

    private String bio;

    @Min(0)
    private int yearsOfExperience;

    @NotNull
    private BigDecimal consultationFee;

    private String phone;
}
