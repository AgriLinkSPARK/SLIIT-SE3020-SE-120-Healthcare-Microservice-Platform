# Payment Service Quick Start Guide

## 5-Minute Setup

### What You'll Build
A complete payment processing system for healthcare consultations with Stripe integration.

---

## Step 1: Get Stripe Keys (2 minutes)

1. Go to https://stripe.com
2. Sign up for a Sandbox account
3. Go to **Developers → API Keys**
4. Copy your keys:
   - **Secret Key**: `sk_test_...`
   - **Publishable Key**: `pk_test_...`
   - **Webhook Secret**: (Create from Webhooks section; this is a signing secret `whsec_...`, not a read/write/none permission)

---

## Step 2: Setup Backend (2 minutes)

```bash
# Navigate to payment service
cd services/payment-service

# If you see "mvn: command not found" on macOS
brew install maven
mvn -v

# Set environment variables
export STRIPE_API_KEY="sk_test_your_key_here"
export STRIPE_WEBHOOK_SECRET="whsec_your_secret_here"

# Build and run
mvn clean install
mvn spring-boot:run
```

**Expected Output:**
```
Started PaymentServiceApplication in X seconds
Tomcat started on port(s): 8004
```

✅ Backend is ready at: `http://localhost:8004/api/v1`

---

## Step 3: Setup Frontend (1 minute)

```bash
# Navigate to frontend
cd frontend

# Install payment libraries
npm install @stripe/react-stripe-js @stripe/stripe-js axios

# Create .env file
cat > .env << EOF
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
REACT_APP_API_BASE_URL=http://localhost:8004/api/v1
EOF

# Start development server
npm start
```

**Expected Output:**
```
Compiled successfully!
On Your Network: http://localhost:3000
```

✅ Frontend is ready at: `http://localhost:3000`

---

## Step 4: Test Payment (1-2 minutes)

### Using cURL

```bash
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

### Using Test Card

Use the following card details in the payment form:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)

---

## File Structure

```
services/payment-service/
├── src/main/java/com/sliit/healthcare/payment/
│   ├── controller/          # REST API endpoints
│   ├── service/             # Business logic
│   ├── entity/              # MongoDB entities
│   ├── repository/          # Data access
│   ├── dto/                 # Request/Response DTOs
│   ├── config/              # Stripe & Async config
│   └── exception/           # Error handling
├── pom.xml                  # Maven dependencies
├── Dockerfile               # Docker configuration
└── *.md                     # Documentation

frontend/
├── src/components/
│   ├── PaymentForm.jsx      # Payment form component
│   ├── PaymentHistory.jsx   # Payment history component
│   └── *.css                # Styling
├── .env                     # Environment variables
└── package.json             # NPM dependencies
```

---

## Key API Endpoints

### Initiate Payment
```http
POST /payments/initiate
```

### Confirm Payment
```http
POST /payments/{paymentId}/confirm?paymentMethodId=pm_xxxxx
```

### Get Payment Status
```http
GET /payments/{paymentId}
```

### Get Patient Payments
```http
GET /payments/patient/{patientId}
```

### Process Refund
```http
POST /payments/{paymentId}/refund
```

---

## Environment Variables

### Backend (.env or system)
```bash
STRIPE_API_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGO_URI=mongodb://localhost:27017/healthcare_payments
```

### Frontend (.env)
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_API_BASE_URL=http://localhost:8004/api/v1
```

---

## Common Issues

### ❌ "Invalid API Key"
```
✅ Solution: Check STRIPE_API_KEY is correctly set
```

### ❌ "mvn: command not found"
```
✅ Solution (macOS): brew install maven && mvn -v
```

### ❌ "Cannot connect to MongoDB"
```
✅ Solution: Start MongoDB: mongod
```

### ❌ "CORS Error"
```
✅ Solution: Add CorsConfig to PaymentServiceApplication.java
```

### ❌ "Payment button doesn't work"
```
✅ Solution: Ensure Stripe.js is loaded in frontend
```

---

## Testing Workflow

1. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd services/payment-service && mvn spring-boot:run
   
   # Terminal 2: Frontend
   cd frontend && npm start
   ```

2. **Open Browser**
   ```
   http://localhost:3000
   ```

3. **Submit Test Payment**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

4. **Check Payment Status**
   ```bash
   curl http://localhost:8004/api/v1/payments/patient/patient-1
   ```

---

## Next Steps

### After Basic Setup

1. **Setup Webhooks** (for async updates)
   - Go to Stripe Dashboard
   - Configure webhook endpoint
   - Listen for payment events

2. **Customize** (add more payment methods)
   - PayHere integration (Sri Lanka)
   - Dialog Genie integration (Sri Lanka)
   - PayPal integration

3. **Deploy** (to production)
   - Use production Stripe keys
   - Configure MongoDB Atlas
   - Set up Docker containers

---

## Documentation Files

| File | Purpose |
|------|---------|
| `PAYMENT_SERVICE_SETUP.md` | Detailed setup guide |
| `INTEGRATION_GUIDE.md` | Complete API documentation |
| `IMPLEMENTATION_SUMMARY.md` | Architecture overview |
| `PAYMENT_COMPONENTS_README.md` | React component guide |

---

## Useful Commands

```bash
# Check service health
curl http://localhost:8004/api/v1/payments/health

# Run tests
mvn test

# Build Docker image
docker build -t payment-service:latest services/payment-service/

# View logs
tail -f services/payment-service/logs/*.log
```

---

## Support Resources

- 🔗 [Stripe API Docs](https://stripe.com/docs/api)
- 🔗 [Spring Boot Docs](https://spring.io/projects/spring-boot)
- 🔗 [MongoDB Docs](https://docs.mongodb.com/)
- 🔗 [React Stripe Docs](https://stripe.com/docs/stripe-js/react)

---

## Status Checklist

### Before Production

- [ ] Stripe API keys configured
- [ ] MongoDB connection working
- [ ] Payment initiation working
- [ ] Payment confirmation working
- [ ] Refund processing working
- [ ] Webhooks configured
- [ ] Tests passing
- [ ] Documentation reviewed
- [ ] Frontend components integrated
- [ ] Error handling tested

---

**🎉 Ready to Go!**

Your payment service is now ready to process healthcare consultation fees securely and efficiently.

**Questions?** Refer to the detailed documentation files or contact the development team.

---

**Last Updated:** January 2024
**Version:** 1.0.0
<br/>
**Status:** ✅ Production Ready
