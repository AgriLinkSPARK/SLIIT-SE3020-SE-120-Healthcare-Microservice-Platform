package com.sliit.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProxyAccessRequestDto {
    @NotNull(message = "Proxy user ID is required")
    private Long proxyUserId;

    @NotBlank(message = "Relationship is required")
    private String relationship;

    private List<String> permissions;
}
