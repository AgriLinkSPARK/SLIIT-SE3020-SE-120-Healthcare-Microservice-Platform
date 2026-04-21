package com.sliit.healthcare.auth.dto;

import com.sliit.healthcare.auth.model.Role;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleUpdateRequest {

    @NotNull
    private Role role;
}
