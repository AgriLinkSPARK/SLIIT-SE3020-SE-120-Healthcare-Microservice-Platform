# Payment Service Integration Guide

## Table of Contents
1. [Backend Setup](#backend-setup)
2. [Frontend Integration](#frontend-integration)
3. [API Documentation](#api-documentation)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

## Backend Setup

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- MongoDB 5.0+
- Stripe Account (Sandbox)

### Step 1: Configure Stripe API Keys

1. Create a Stripe account at https://stripe.com
2. Navigate to Dashboard → Developers → API Keys
3. Copy the following keys:
   - Secret Key: `sk_test_...`
   - Publishable Key: `pk_test_...`

### Step 2: Set Environment Variables

```bash
# Linux/Mac
export STRIPE_API_KEY="sk_test_your_key_here"
export STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
export STRIPE_WEBHOOK_SECRET="whsec_your_secret_here"
export MONGO_URI="mongodb://localhost:27017/healthcare_payments"

# Windows (Command Prompt)
set STRIPE_API_KEY=sk_test_your_key_here
set STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
set MONGO_URI=mongodb://localhost:27017/healthcare_payments
```

### Step 3: Build and Run Payment Service

```bash
cd services/payment-service

# Clean build
mvn clean install

# Run application
mvn spring-boot:run
```

The service will start on: `http://localhost:8004/api/v1`

### Step 4: Setup Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Configure the following:
   - **Endpoint URL**: `https://your-domain/api/v1/webhooks/stripe`
   - **Events**: Select the following events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `charge.refunded`
4. Copy the webhook signing secret and set as `STRIPE_WEBHOOK_SECRET`

## Frontend Integration

### Prerequisites
- Node.js 16+ and npm
- React 18+

### Step 1: Install Stripe Libraries

```bash
cd frontend

npm install @stripe/react-stripe-js @stripe/stripe-js
npm install axios
```

### Step 2: Configure Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
REACT_APP_API_BASE_URL=http://localhost:8004/api/v1
```

### Step 3: Import Payment Components

In your React component:

```javascript
import PaymentForm from './components/PaymentForm';
import PaymentHistory from './components/PaymentHistory';

function ConsultationPage() {
  return (
    <div>
      <PaymentForm
        consultationId="consultation-123"
        patientId="patient-456"
        doctorId="doctor-789"
        amount={50.00}
        onSuccess={(data) => console.log('Payment successful:', data)}
        onError={(error) => console.error('Payment error:', error)}
      />
      
      <PaymentHistory
        patientId="patient-456"
        status="SUCCEEDED"
      />
    </div>
  );
}
```

## API Documentation

### Base URL
```
http://localhost:8004/api/v1
```

### 1. Initiate Payment

**Endpoint:** `POST /payments/initiate`

**Request Body:**
```json
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

**Response (Success):**
```json
{
  "id": "payment-id-123",
  "consultationId": "consultation-123",
  "patientId": "patient-456",
  "amount": 50.00,
  "currency": "USD",
  "status": "PENDING",
  "paymentMethod": "STRIPE",
  "transactionId": "pi_1234567890",
  "createdAt": "2024-01-15T10:30:00",
  "success": true,
  "message": "Payment initiated successfully"
}
```

### 2. Confirm Payment

**Endpoint:** `POST /payments/{paymentId}/confirm?paymentMethodId={paymentMethodId}`

**Response (Success):**
```json
{
  "id": "payment-id-123",
  "status": "SUCCEEDED",
  "paidAt": "2024-01-15T10:35:00",
  "transactionId": "pi_1234567890",
  "success": true,
  "message": "Payment confirmed"
}
```

### 3. Get Payment Details

**Endpoint:** `GET /payments/{paymentId}`

**Response:**
```json
{
  "id": "payment-id-123",
  "consultationId": "consultation-123",
  "patientId": "patient-456",
  "doctorId": "doctor-789",
  "amount": 50.00,
  "currency": "USD",
  "status": "SUCCEEDED",
  "paymentMethod": "STRIPE",
  "transactionId": "pi_1234567890",
  "description": "Consultation fee",
  "createdAt": "2024-01-15T10:30:00",
  "paidAt": "2024-01-15T10:35:00",
  "success": true
}
```

### 4. Get Patient Payments

**Endpoint:** `GET /payments/patient/{patientId}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-1",
      "consultationId": "consultation-123",
      "amount": 50.00,
      "status": "SUCCEEDED",
      "createdAt": "2024-01-15T10:30:00"
    },
    {
      "id": "payment-2",
      "consultationId": "consultation-124",
      "amount": 75.00,
      "status": "PENDING",
      "createdAt": "2024-01-16T14:00:00"
    }
  ],
  "count": 2
}
```

### 5. Get Consultation Payment

**Endpoint:** `GET /payments/consultation/{consultationId}`

**Response:**
```json
{
  "id": "payment-id-123",
  "consultationId": "consultation-123",
  "status": "SUCCEEDED",
  "transactionId": "pi_1234567890",
  "success": true
}
```

### 6. Process Refund

**Endpoint:** `POST /payments/{paymentId}/refund`

**Request Body:**
```json
{
  "reason": "requested_by_customer",
  "amount": 50.00,
  "notes": "Patient cancellation"
}
```

**Response (Success):**
```json
{
  "id": "payment-id-123",
  "status": "REFUNDED",
  "refundId": "re_1234567890",
  "success": true,
  "message": "Refund processed successfully"
}
```

### 7. Payment History with Filter

**Endpoint:** `GET /payments/history/{patientId}?status=SUCCEEDED`

**Supported Status Values:**
- PENDING
- PROCESSING
- SUCCEEDED
- FAILED
- CANCELLED
- REFUNDED
- PARTIAL_REFUND

## Testing

### 1. Test Stripe Payment with Sandbox Cards

Use these test card numbers from Stripe:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

**Card Declined:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**Authentication Required:**
- Card Number: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

### 2. API Testing with cURL

```bash
# Initiate Payment
curl -X POST http://localhost:8004/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "consultationId": "test-consultation-1",
    "patientId": "test-patient-1",
    "doctorId": "test-doctor-1",
    "amount": 50.00,
    "currency": "USD",
    "paymentMethod": "STRIPE",
    "description": "Test payment",
    "customerEmail": "test@example.com",
    "customerName": "Test User"
  }'

# Get Payment Details
curl http://localhost:8004/api/v1/payments/{paymentId}

# Get Patient Payments
curl http://localhost:8004/api/v1/payments/patient/test-patient-1
```

### 3. Unit Tests

Run the test suite:

```bash
mvn test
```

### 4. Integration Tests

```bash
mvn verify
```

## Deployment

### Docker Deployment

1. Build Docker image:
```bash
docker build -t payment-service:latest services/payment-service/
```

2. Run with Docker Compose:
```bash
docker-compose up -d payment-service
```

### Kubernetes Deployment

1. Build and push image:
```bash
docker build -t your-registry/payment-service:latest services/payment-service/
docker push your-registry/payment-service:latest
```

2. Apply Kubernetes manifests:
```bash
kubectl apply -f k8s/payment-service-deployment.yaml
kubectl apply -f k8s/payment-service-service.yaml
```

### Production Configuration

Update environment variables for production:

```bash
# Use production Stripe keys
export STRIPE_API_KEY="sk_live_your_production_key"
export STRIPE_PUBLISHABLE_KEY="pk_live_your_production_key"

# Set production URLs
export PAYMENT_SUCCESS_URL="https://your-domain.com/payment/success"
export PAYMENT_FAILURE_URL="https://your-domain.com/payment/failure"

# Database
export MONGO_URI="mongodb+srv://user:password@cluster.mongodb.net/healthcare_payments"
```

## Troubleshooting

### Issue: Stripe API Key Error
```
Error: Invalid API Key provided
```
**Solution:**
1. Verify API key is correct (starts with `sk_test_` for sandbox)
2. Check environment variable is set: `echo $STRIPE_API_KEY`
3. Restart the application

### Issue: Webhook Signature Verification Failed
```
Error: Webhook signature verification failed
```
**Solution:**
1. Verify webhook secret matches in Stripe Dashboard
2. Check log for signature details
3. Resend webhook from Stripe Dashboard: Developers → Webhooks → Event → Resend

### Issue: MongoDB Connection Error
```
Error: Could not connect to MongoDB
```
**Solution:**
1. Start MongoDB: `mongod` or `docker run mongo`
2. Check connection string in `application.yaml`
3. Verify MongoDB is running: `mongo --version`

### Issue: CORS Error in Frontend

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Add CORS configuration to `PaymentServiceApplication.java`:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://your-domain.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Issue: Async Timeout

```
CompletableFuture timed out
```

**Solution:**
1. Increase request timeout in frontend
2. Adjust thread pool size in `AsyncConfig`
3. Check Stripe API response time

## Support Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Stripe Documentation](https://stripe.com/docs/stripe-js/react)

## Next Steps

1. Test with sandbox API keys
2. Implement security best practices
3. Set up monitoring and alerting
4. Create admin dashboard for payment management
5. Implement additional payment methods (PayHere, Dialog Genie, FriMi)
6. Add payment analytics and reporting

---

**Last Updated:** January 2024
**Version:** 1.0.0
