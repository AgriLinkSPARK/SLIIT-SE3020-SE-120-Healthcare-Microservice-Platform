package com.sliit.healthcare.patient.controller;

import com.sliit.healthcare.patient.dto.ApiResponse;
import com.sliit.healthcare.patient.dto.BillPaymentRequestDto;
import com.sliit.healthcare.patient.dto.BillResponseDto;
import com.sliit.healthcare.patient.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/patients/{patientId}/bills")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponseDto>>> getBillsByPatient(@PathVariable String patientId) {
        log.info("Fetching bills for patient: {}", patientId);
        List<BillResponseDto> bills = billingService.getBillsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(bills));
    }

    @PostMapping("/{billId}/pay")
    public ResponseEntity<ApiResponse<BillResponseDto>> payBill(
            @PathVariable String patientId,
            @PathVariable String billId,
            @Valid @RequestBody BillPaymentRequestDto paymentDetails) {
        log.info("Paying bill {} for patient: {}", billId, patientId);
        BillResponseDto bill = billingService.payBill(patientId, billId, paymentDetails);
        return ResponseEntity.ok(ApiResponse.success("Bill paid successfully", bill));
    }

    @GetMapping("/expenses")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalExpenses(
            @PathVariable String patientId,
            @RequestParam Integer year) {
        log.info("Fetching expenses for patient: {} for year: {}", patientId, year);
        BigDecimal total = billingService.getTotalExpenses(patientId, year);
        return ResponseEntity.ok(ApiResponse.success(total));
    }
}
