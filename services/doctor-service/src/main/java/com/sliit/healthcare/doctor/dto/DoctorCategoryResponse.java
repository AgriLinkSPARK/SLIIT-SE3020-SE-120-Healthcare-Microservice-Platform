package com.sliit.healthcare.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorCategoryResponse {
    private String id;
    private String name;
    private String description;
    private Integer displayOrder;
}
