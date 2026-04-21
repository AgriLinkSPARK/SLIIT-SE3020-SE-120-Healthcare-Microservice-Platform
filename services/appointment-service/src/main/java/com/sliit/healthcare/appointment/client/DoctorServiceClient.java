package com.sliit.healthcare.appointment.client;

import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.sliit.healthcare.appointment.dto.DoctorSearchResponse;

/**
 * HTTP client that calls the doctor-service REST API to fetch real doctor data
 * from the database instead of using hardcoded values.
 */
@Component
public class DoctorServiceClient {

    private static final Logger log = LoggerFactory.getLogger(DoctorServiceClient.class);

    private final RestTemplate restTemplate;
    private final String doctorServiceUrl;

    public DoctorServiceClient(RestTemplate restTemplate,
                               @Value("${doctor-service.url}") String doctorServiceUrl) {
        this.restTemplate = restTemplate;
        this.doctorServiceUrl = doctorServiceUrl.replaceAll("/+$", "");
    }

    /**
     * Fetches doctors from the doctor-service's public booking-options endpoint,
     * optionally filtering by specialty.
     */
    public List<DoctorSearchResponse> searchDoctors(String specialty) {
        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder
                    .fromUriString(doctorServiceUrl + "/api/doctor/public/booking-options");

            if (specialty != null && !specialty.isBlank()) {
                uriBuilder.queryParam("specialty", specialty.trim());
            }

            String url = uriBuilder.toUriString();
            log.debug("Calling doctor-service: {}", url);

            ResponseEntity<List<DoctorBookingOption>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {});

            if (response.getBody() == null) {
                return Collections.emptyList();
            }

            return response.getBody().stream()
                    .map(option -> DoctorSearchResponse.builder()
                            .doctorId(option.doctorId())
                            .doctorName(option.fullName())
                            .specialty(option.specialization())
                            .qualifications(option.qualifications())
                            .consultationFee(option.consultationFee())
                            .verified(option.verified())
                            .build())
                    .toList();

        } catch (Exception ex) {
            log.error("Failed to fetch doctors from doctor-service at {}: {}", doctorServiceUrl, ex.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Internal record that maps the JSON response from the doctor-service
     * /api/doctor/public/booking-options endpoint.
     */
    private record DoctorBookingOption(
            String doctorId,
            String fullName,
            String specialization,
            String qualifications,
            String bio,
            int yearsOfExperience,
            java.math.BigDecimal consultationFee,
            String phone,
            boolean verified,
            java.util.List<?> availabilitySlots) {
    }
}
