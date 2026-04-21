# Healthcare Payment Service - Complete Implementation

## Project Overview

This is a comprehensive implementation of a **Secure Online Payment Gateway Integration Service** for the Healthcare Microservices Platform. The service handles consultation fee payments using Stripe as the primary payment processor, with templates for Sri Lankan payment gateways (PayHere, Dialog Genie, FriMi).

## Architecture

### Technology Stack

**Backend:**
- **Framework:** Spring Boot 4.0.4
- **Language:** Java 17
- **Database:** MongoDB
- **Payment Gateway:** Stripe (Primary), Templates for PayHere, Dialog Genie, FriMi
- **Authentication:** Spring Security
- **Async Processing:** Spring @Async with ThreadPoolTaskExecutor
- **API Documentation:** RESTful with JSON
- **Containerization:** Docker

**Frontend:**
- **Framework:** React 18+
- **Payment UI:** Stripe React Stripe.js
- **HTTP Client:** Axios
- **Styling:** CSS3
- **State Management:** React Hooks

**Infrastructure:**
- **Orchestration:** Docker Compose / Kubernetes
- **Message Queue:** (Optional - for future enhancement)
- **Monitoring:** Spring Boot Actuator

## Folder Structure

```
services/payment-service/
├── src/
│   ├── main/
│   │   ├── java/com/sliit/healthcare/payment/
│   │   │   ├── entity/
│   │   │   │   └── Payment.java
│   │   │   ├── dto/
│   │   │   │   ├── PaymentRequestDTO.java
│   │   │   │   ├── PaymentResponseDTO.java
│   │   │   │   ├── RefundRequestDTO.java
│   │   │   │   └── StripeWebhookDTO.java
│   │   │   ├── repository/
│   │   │   │   └── PaymentRepository.java
│   │   │   ├── service/
│   │   │   │   ├── PaymentService.java
│   │   │   │   ├── StripeWebhookService.java
│   │   │   │   └── SriLankanPaymentGatewayService.java
│   │   │   ├── controller/
│   │   │   │   ├── PaymentController.java
│   │   │   │   └── StripeWebhookController.java
│   │   │   ├── config/
│   │   │   │   ├── StripeConfig.java
│   │   │   │   └── AsyncConfig.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── PaymentProcessingException.java
│   │   │   └── PaymentServiceApplication.java
│   │   └── resources/
│   │       └── application.yaml
│   └── test/...
├── pom.xml
├── Dockerfile
├── PAYMENT_SERVICE_SETUP.md
├── INTEGRATION_GUIDE.md
└── README.md

frontend/
├── src/components/
│   ├── PaymentForm.jsx
│   ├── PaymentForm.css
│   ├── PaymentHistory.jsx
│   └── PaymentHistory.css
├── .env.example
└── package.json.payment-example
```

## Key Features Implemented

### 1. Stripe Integration ✅
- Full Payment Intent workflow
- Asynchronous payment processing
- Webhook support for real-time payment status updates
- Refund management
- Error handling and retry logic

### 2. Asynchronous Processing ✅
- Async payment initiation
- Async payment confirmation
- Async refund processing
- Async webhook event processing
- Configurable thread pools

### 3. RESTful API Endpoints ✅
- `POST /payments/initiate` - Initiate new payment
- `POST /payments/{paymentId}/confirm` - Confirm payment
- `GET /payments/{paymentId}` - Get payment details
- `GET /payments/patient/{patientId}` - Get patient's payments
- `GET /payments/consultation/{consultationId}` - Get consultation payment
- `POST /payments/{paymentId}/refund` - Process refund
- `GET /payments/history/{patientId}` - Get payment history with filtering
- `POST /webhooks/stripe` - Webhook endpoint for Stripe events

### 4. Database (MongoDB) ✅
- Payment entity with comprehensive fields
- Custom MongoDB queries
- Indexing for performance
- Document versioning and timestamps

### 5. Security ✅
- Spring Security integration
- Input validation using Jakarta Validation
- Stripe webhook signature verification
- Error handling with appropriate HTTP status codes
- Sensitive data protection

### 6. React Frontend Components ✅
- PaymentForm component with Stripe Elements
- PaymentHistory component with filtering
- Responsive design
- Error handling
- Loading states

### 7. Configuration Management ✅
- Environment-based configuration
- Stripe API key management
- MongoDB connection settings
- Async executor configuration
- Logging configuration

### 8. Documentation ✅
- Setup guide with prerequisites
- Integration guide with examples
- API documentation
- Frontend integration examples
- Troubleshooting guide

## API Endpoints Summary

### Payment Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/initiate` | Initiate new payment |
| POST | `/payments/{paymentId}/confirm` | Confirm payment |
| GET | `/payments/{paymentId}` | Get payment details |
| GET | `/payments/patient/{patientId}` | Get patient payments |
| GET | `/payments/consultation/{consultationId}` | Get consultation payment |
| POST | `/payments/{paymentId}/refund` | Process refund |
| GET | `/payments/history/{patientId}` | Get payment history |
| GET | `/payments/health` | Health check |

### Webhook Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/stripe` | Stripe webhook endpoint |
| GET | `/webhooks/health` | Webhook health check |

## Database Schema

### MongoDB Collection: payments

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

## Supported Payment Statuses

- **PENDING** - Payment initiated, awaiting confirmation
- **PROCESSING** - Payment is being processed
- **SUCCEEDED** - Payment completed successfully
- **FAILED** - Payment processing failed
- **CANCELLED** - Payment was cancelled
- **REFUNDED** - Full refund processed
- **PARTIAL_REFUND** - Partial refund processed

## Async Processing Flow

```
┌─────────────────┐
│ Payment Request │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│ Initiate Payment (Async)     │
│ - Create Stripe PaymentIntent│
│ - Save to MongoDB            │
│ - Return payment record      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Confirm Payment (Async)      │
│ - Create payment method      │
│ - Confirm PaymentIntent      │
│ - Update status in DB        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Webhook Events (Async)       │
│ - payment_intent.succeeded   │
│ - payment_intent.failed      │
│ - charge.refunded            │
│ - Update status asynchronously
└──────────────────────────────┘
```

## Security Features

1. **API Key Management**
   - Stripe API keys stored in environment variables
   - Never hardcoded in source code

2. **Webhook Verification**
   - Stripe signature verification using HMAC-SHA256
   - Invalid signatures rejected

3. **Input Validation**
   - Jakarta Validation annotations
   - DTO validation on all endpoints
   - Amount and currency validation

4. **Error Handling**
   - Global exception handler
   - Appropriate HTTP status codes
   - Sensitive error information filtered

5. **Logging**
   - Comprehensive transaction logging
   - Audit trail for all payment operations
   - Error and warning logs for troubleshooting

## Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- MongoDB 5.0+
- Node.js 16+ (for frontend)
- Stripe Account (https://stripe.com)

### Backend Setup

```bash
# 1. Set environment variables
export STRIPE_API_KEY="sk_test_..."
export STRIPE_PUBLISHABLE_KEY="pk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."

# 2. Build and run
cd services/payment-service
mvn clean install
mvn spring-boot:run

# Service runs on http://localhost:8004/api/v1
```

### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install @stripe/react-stripe-js @stripe/stripe-js axios

# 2. Create .env file
echo "REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_..." > .env

# 3. Start development server
npm start
```

## Testing

### Test Stripe Cards (Sandbox)

| Card Type | Number | Expiry | CVC |
|-----------|--------|--------|-----|
| Successful | 4242 4242 4242 4242 | Any future | Any 3 digits |
| Declined | 4000 0000 0000 0002 | Any future | Any 3 digits |
| Auth Required | 4000 0025 0000 3155 | Any future | Any 3 digits |

### API Testing

```bash
# Initiate Payment
curl -X POST http://localhost:8004/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "consultationId": "test-1",
    "patientId": "patient-1",
    "doctorId": "doctor-1",
    "amount": 50.00,
    "currency": "USD",
    "paymentMethod": "STRIPE",
    "description": "Test payment",
    "customerEmail": "test@example.com",
    "customerName": "Test User"
  }'
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t payment-service:latest services/payment-service/

# Run with Docker Compose
docker-compose up -d payment-service
```

### Production Deployment

1. Use production Stripe keys
2. Set HTTPS for webhook endpoints
3. Configure production MongoDB connection
4. Scale async executor pools as needed
5. Set up monitoring and alerting

## Future Enhancements

1. **Additional Payment Methods**
   - Full PayHere integration
   - Dialog Genie integration
   - FriMi integration
   - PayPal production implementation

2. **Advanced Features**
   - Payment installments
   - Subscription management
   - Payment analytics dashboard
   - Automated invoice generation
   - Multi-currency support

3. **Performance Optimization**
   - Payment processing caching
   - Database query optimization
   - Async response streaming

4. **Monitoring & Analytics**
   - Payment metrics dashboard
   - Transaction reporting
   - Fraud detection
   - Payment reconciliation

## Troubleshooting

### Common Issues

1. **Stripe API Key Error**
   ```
   Error: Invalid API Key provided
   Solution: Verify API key format and environment variable
   ```

2. **Webhook Signature Verification Failed**
   ```
   Error: Webhook signature verification failed
   Solution: Check webhook secret in Stripe Dashboard
   ```

3. **MongoDB Connection Error**
   ```
   Error: Could not connect to MongoDB
   Solution: Ensure MongoDB is running
   ```

4. **CORS Errors in Frontend**
   ```
   Error: Access to XMLHttpRequest blocked by CORS policy
   Solution: Add CorsConfig to PaymentServiceApplication
   ```

## Documentation Files

1. **PAYMENT_SERVICE_SETUP.md** - Setup and configuration guide
2. **INTEGRATION_GUIDE.md** - Complete integration instructions
3. **PaymentForm.jsx** - React payment component
4. **SriLankanPaymentGatewayService.java** - Gateway templates

## Support & Resources

- [Stripe API Reference](https://stripe.com/docs/api)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Stripe Documentation](https://stripe.com/docs/stripe-js/react)

## Version Information

- **Version:** 1.0.0
- **Last Updated:** January 2024
- **Java Version:** 17
- **Spring Boot Version:** 4.0.4
- **MongoDB Version:** 5.0+

## License

This project is part of the Healthcare Microservices Platform and follows the same license terms.

---

**Development Team:** Healthcare Services Team
**Status:** ✅ Complete Implementation
**Ready for:** Integration Testing, Staging, Production Deployment
