package com.sliit.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientFromAuthDto {
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String dateOfBirth;
    private String gender;
    private String emergencyContact;
    private String bloodType;
    private String allergies;
    private String medicalConditions;
}
