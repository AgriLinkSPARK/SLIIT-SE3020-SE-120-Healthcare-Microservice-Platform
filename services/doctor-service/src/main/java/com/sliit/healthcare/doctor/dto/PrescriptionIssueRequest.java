package com.sliit.healthcare.doctor.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PrescriptionIssueRequest {

    @NotBlank
    private String prescriptionId;

    @NotBlank
    private String patientId;

    @NotBlank
    private String consultationId;

    @NotBlank
    private String diagnosis;

    @NotEmpty
    private List<String> medications;

    private String additionalNotes;
}
