package com.sliit.healthcare.payment.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {

    @Value("${stripe.api.key:sk_test_}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret:whsec_}")
    private String webhookSecret;

    public StripeConfig(@Value("${stripe.api.key:sk_test_}") String stripeApiKey) {
        this.stripeApiKey = stripeApiKey;
        Stripe.apiKey = stripeApiKey;
    }

    public String getStripeApiKey() {
        return stripeApiKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
