package com.sliit.healthcare.patient.service;

import com.sliit.healthcare.patient.dto.BillPaymentRequestDto;
import com.sliit.healthcare.patient.dto.BillResponseDto;
import com.sliit.healthcare.patient.exception.ResourceNotFoundException;
import com.sliit.healthcare.patient.exception.ValidationException;
import com.sliit.healthcare.patient.model.Bill;
import com.sliit.healthcare.patient.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillRepository billRepository;

    @Transactional(readOnly = true)
    public List<BillResponseDto> getBillsByPatient(String patientId) {
        return billRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BillResponseDto payBill(String patientId, String billId, BillPaymentRequestDto paymentDetails) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", billId));
        
        if (!bill.getPatientId().equals(patientId)) {
            throw new ValidationException("Bill does not belong to this patient");
        }
        
        bill.setStatus(Bill.BillStatus.PAID);
        bill.setPaidAt(LocalDateTime.now());
        bill.setPaymentMethod(paymentDetails.getPaymentMethod());
        
        return mapToResponseDto(billRepository.save(bill));
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalExpenses(String patientId, Integer year) {
        return billRepository.findByPatientId(patientId).stream()
                .filter(b -> b.getStatus() == Bill.BillStatus.PAID)
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().getYear() == year)
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BillResponseDto mapToResponseDto(Bill bill) {
        return BillResponseDto.builder()
                .id(bill.getId())
                .patientId(bill.getPatientId())
                .description(bill.getDescription())
                .amount(bill.getAmount())
                .dueDate(bill.getDueDate())
                .status(bill.getStatus().name())
                .paidAt(bill.getPaidAt())
                .paymentMethod(bill.getPaymentMethod())
                .createdAt(bill.getCreatedAt())
                .build();
    }
}
