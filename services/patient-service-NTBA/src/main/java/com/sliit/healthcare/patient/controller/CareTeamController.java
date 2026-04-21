package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.model.CareTeamMember;
import com.sliit.healthcare.patient.service.CareTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/care-team")
@RequiredArgsConstructor
public class CareTeamController {

    private final CareTeamService careTeamService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CareTeamMember>>> getCareTeam(@PathVariable String patientId) {
        List<CareTeamMember> careTeam = careTeamService.getCareTeam(patientId);
        return ResponseEntity.ok(ApiResponse.success(careTeam));
    }
}
