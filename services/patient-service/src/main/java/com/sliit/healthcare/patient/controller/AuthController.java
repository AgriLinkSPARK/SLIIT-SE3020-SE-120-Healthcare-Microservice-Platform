package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.LoginRequestDto;
import com.sliit.healthcare.patient.dto.LoginResponseDto;
import com.sliit.healthcare.patient.dto.PatientRequestDto;
import com.sliit.healthcare.patient.dto.PatientResponseDto;
import com.sliit.healthcare.patient.exception.ValidationException;
import com.sliit.healthcare.patient.model.Patient;
import com.sliit.healthcare.patient.repository.PatientRepository;
import com.sliit.healthcare.patient.security.JwtUtil;
import com.sliit.healthcare.patient.service.PatientProfileService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientProfileService patientProfileService;

    public AuthController(PatientRepository patientRepository, PasswordEncoder passwordEncoder,
                          PatientProfileService patientProfileService) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.patientProfileService = patientProfileService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<PatientResponseDto>> register(@Valid @RequestBody PatientRequestDto requestDto) {
        log.info("Registering new patient with email: {}", requestDto.getEmail());
        PatientResponseDto createdPatient = patientProfileService.createPatient(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Patient registered successfully", createdPatient));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@Valid @RequestBody LoginRequestDto requestDto) {
        log.info("Login attempt for email: {}", requestDto.getEmail());
        Patient patient = patientRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new ValidationException("Invalid email or password"));

        if (patient.getPassword() == null || !passwordEncoder.matches(requestDto.getPassword(), patient.getPassword())) {
            throw new ValidationException("Invalid email or password");
        }

        String token = JwtUtil.generateToken(patient.getEmail());
        LoginResponseDto responseDto = LoginResponseDto.builder().token(token).build();

        log.info("Login successful for email: {}", requestDto.getEmail());
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("Login successful", responseDto));
    }
}
