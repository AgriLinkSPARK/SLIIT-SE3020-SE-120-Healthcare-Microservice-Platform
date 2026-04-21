# Payment Service - Setup Guide

## Overview
The Payment Service is a Spring Boot microservice that handles secure online payment processing for healthcare consultations using Stripe as the primary payment gateway.

## Features
- ✅ Stripe Payment Gateway Integration
- ✅ Support for multiple payment methods (Card, Wallet, etc.)
- ✅ Asynchronous payment processing
- ✅ Webhook support for real-time payment status updates
- ✅ Refund management
- ✅ MongoDB data persistence
- ✅ RESTful API endpoints
- ✅ Comprehensive error handling
- ✅ Payment history and analytics

## Prerequisites
- Java 17+
- Spring Boot 4.0.4
- MongoDB 5.0+
- Maven 3.8+
- Stripe Account (Create sandbox account at https://stripe.com)

## Installation

### 1. Configure Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Stripe Configuration
export STRIPE_API_KEY="sk_test_YOUR_TEST_API_KEY"
export STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_TEST_PUBLISHABLE_KEY"
export STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# Payment Configuration
export PAYMENT_SUCCESS_URL="http://localhost:3000/payment/success"
export PAYMENT_FAILURE_URL="http://localhost:3000/payment/failure"

# MongoDB Configuration
export MONGO_URI="mongodb://localhost:27017/healthcare_payments"
```

### 2. Get Stripe API Keys

1. Go to https://dashboard.stripe.com/
2. Navigate to Developers → API Keys
3. Copy your Secret Key (sk_test_...) and Publishable Key (pk_test_...)
4. Set these in your environment variables

### 3. Setup Stripe Webhook

1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. Configure endpoint URL: `https://your-api-domain/api/v1/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the webhook signing secret and set it as `STRIPE_WEBHOOK_SECRET`

### 4. Build the Service

```bash
cd services/payment-service
mvn clean install
```

### 5. Run the Service

```bash
mvn spring-boot:run
```

The service will start on `http://localhost:8004/api/v1`

## API Endpoints

### 1. Initiate Payment
```http
POST /api/v1/payments/initiate
Content-Type: application/json

{
  "consultationId": "consultation-123",
  "patientId": "patient-456",
  "doctorId": "doctor-789",
  "amount": 50.00,
  "currency": "USD",
  "paymentMethod": "STRIPE",
  "description": "Consultation fee for Dr. Smith",
  "customerEmail": "patient@example.com",
  "customerName": "John Doe"
}
```

### 2. Confirm Payment
```http
POST /api/v1/payments/{paymentId}/confirm?paymentMethodId=pm_1234567890
```

### 3. Get Payment Details
```http
GET /api/v1/payments/{paymentId}
```

### 4. Get Patient Payments
```http
GET /api/v1/payments/patient/{patientId}
```

### 5. Get Consultation Payment
```http
GET /api/v1/payments/consultation/{consultationId}
```

### 6. Request Refund
```http
POST /api/v1/payments/{paymentId}/refund
Content-Type: application/json

{
  "reason": "requested_by_customer",
  "amount": 50.00,
  "notes": "Patient requested cancellation"
}
```

### 7. Payment History with Status Filter
```http
GET /api/v1/payments/history/{patientId}?status=SUCCEEDED
```

## Status Codes

| Status | Description |
|--------|-------------|
| PENDING | Payment initiated, awaiting confirmation |
| PROCESSING | Payment is being processed |
| SUCCEEDED | Payment completed successfully |
| FAILED | Payment processing failed |
| CANCELLED | Payment was cancelled |
| REFUNDED | Full refund processed |
| PARTIAL_REFUND | Partial refund processed |

## Database Schema

MongoDB Collections:

### payments
```javascript
{
  "_id": ObjectId,
  "consultationId": String,
  "patientId": String,
  "doctorId": String,
  "amount": Decimal128,
  "currency": String,
  "status": String,
  "paymentMethod": String,
  "stripePaymentIntentId": String,
  "stripeCustomerId": String,
  "transactionId": String,
  "description": String,
  "failureReason": String,
  "createdAt": Date,
  "updatedAt": Date,
  "paidAt": Date,
  "receiptUrl": String,
  "refundId": String,
  "refundRequested": Boolean
}
```

## Integration with Frontend (React)

### Example Payment Flow

```javascript
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

async function initiatePayment() {
  try {
    // Step 1: Initiate payment on backend
    const response = await axios.post(
      'http://localhost:8004/api/v1/payments/initiate',
      {
        consultationId: 'consultation-123',
        patientId: 'patient-456',
        doctorId: 'doctor-789',
        amount: 50.00,
        currency: 'USD',
        paymentMethod: 'STRIPE',
        description: 'Consultation fee',
        customerEmail: 'patient@example.com'
      }
    );

    const paymentId = response.data.id;
    const clientSecret = response.data.clientSecret;

    // Step 2: Use Stripe Elements to collect payment details
    const stripe = await stripePromise;
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    });

    // Step 3: Confirm payment on backend
    const confirmResponse = await axios.post(
      `http://localhost:8004/api/v1/payments/${paymentId}/confirm`,
      null,
      { params: { paymentMethodId: paymentMethod.id } }
    );

    if (confirmResponse.data.success) {
      console.log('Payment successful!');
      // Redirect to success page
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
}
```

## Docker Support

Build Docker image:
```bash
docker build -t payment-service:latest .
```

Run with Docker Compose:
```bash
docker-compose up payment-service
```

## Troubleshooting

### 1. Stripe API Key Not Found
```
Error: Invalid API Key provided
```
**Solution:** Ensure `STRIPE_API_KEY` environment variable is set correctly.

### 2. Webhook Signature Verification Failed
```
Error: Webhook signature verification failed
```
**Solution:** Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard.

### 3. MongoDB Connection Error
```
Error: Could not connect to MongoDB
```
**Solution:** Ensure MongoDB is running and `MONGO_URI` is correctly set.

### 4. Async Timeout
```
Error: CompletableFuture timed out
```
**Solution:** Increase thread pool size in `AsyncConfig` or adjust request timeout.

## Security Considerations

1. **API Keys**: Store sensitive keys in environment variables, never in code
2. **HTTPS**: Always use HTTPS for webhook endpoints in production
3. **Signature Verification**: All webhooks are verified using Stripe's signature
4. **Rate Limiting**: Implement rate limiting for production
5. **Validation**: All input data is validated using Jakarta validation
6. **Audit Logging**: All payment transactions are logged for audit purposes

## Performance Optimization

1. **Async Processing**: All payment processing uses async methods
2. **Thread Pooling**: Configurable thread pools for concurrent operations
3. **Caching**: Can be added for frequently accessed payment history
4. **Indexing**: MongoDB indexes on consultationId, patientId for fast queries

## Testing

Run unit tests:
```bash
mvn test
```

Run integration tests:
```bash
mvn verify
```

## Documentation

- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)

## Support

For issues or questions, please contact the development team or refer to the project documentation.
