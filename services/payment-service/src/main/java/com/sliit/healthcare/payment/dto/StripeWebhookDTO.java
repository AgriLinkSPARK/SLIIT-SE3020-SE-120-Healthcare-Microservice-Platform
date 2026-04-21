package com.sliit.healthcare.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripeWebhookDTO {

    private String id;

    private String type;

    private String apiVersion;

    private Long created;

    private Object data;

    private Boolean livemode;

    private Long pendingWebhooks;

    private String request;
}
