# React Payment Integration Components

This directory contains React components for integrating Stripe payment functionality into the Healthcare Consultation Platform.

## Components

### 1. PaymentForm.jsx

A complete payment form component that handles:
- Stripe Elements integration
- Payment method creation
- Asynchronous payment processing
- Error handling and display
- Loading states

#### Usage

```javascript
import PaymentForm from './components/PaymentForm';

function App() {
  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    // Redirect or update UI
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Display error message
  };

  return (
    <PaymentForm
      consultationId="consultation-123"
      patientId="patient-456"
      doctorId="doctor-789"
      amount={50.00}
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `consultationId` | string | Yes | Unique consultation identifier |
| `patientId` | string | Yes | Patient identifier |
| `doctorId` | string | Yes | Doctor identifier |
| `amount` | number | Yes | Payment amount in USD |
| `onSuccess` | function | No | Callback on successful payment |
| `onError` | function | No | Callback on payment error |

### 2. PaymentHistory.jsx

A component that displays payment history with:
- Pagination support
- Status filtering
- Refund request functionality
- Responsive table layout

#### Usage

```javascript
import PaymentHistory from './components/PaymentHistory';

function PaymentPage() {
  return (
    <PaymentHistory
      patientId="patient-456"
      status="SUCCEEDED"
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `patientId` | string | Yes | Patient identifier |
| `status` | string | No | Filter by payment status (PENDING, SUCCEEDED, FAILED, etc.) |

## Installation

### 1. Install Dependencies

```bash
cd frontend

npm install @stripe/react-stripe-js @stripe/stripe-js
npm install @stripe/stripe-js
npm install axios
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
REACT_APP_API_BASE_URL=http://localhost:8004/api/v1
REACT_APP_PAYMENT_SERVICE_URL=http://localhost:8004
```

### 3. Setup in Main App

```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './components/PaymentForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        consultationId="consultation-123"
        patientId="patient-456"
        doctorId="doctor-789"
        amount={50.00}
      />
    </Elements>
  );
}
```

## API Integration

### Backend API Endpoints

The components communicate with the following backend endpoints:

#### 1. Initiate Payment
```
POST /api/v1/payments/initiate
Content-Type: application/json

Request Body:
{
  "consultationId": "string",
  "patientId": "string",
  "doctorId": "string",
  "amount": number,
  "currency": "USD",
  "paymentMethod": "STRIPE",
  "description": "string",
  "customerEmail": "string",
  "customerName": "string"
}

Response:
{
  "id": "payment-id",
  "status": "PENDING",
  "success": true,
  "message": "Payment initiated successfully"
}
```

#### 2. Confirm Payment
```
POST /api/v1/payments/{paymentId}/confirm?paymentMethodId={paymentMethodId}

Response:
{
  "id": "payment-id",
  "status": "SUCCEEDED",
  "transactionId": "pi_...",
  "success": true,
  "message": "Payment confirmed"
}
```

#### 3. Get Payment History
```
GET /api/v1/payments/patient/{patientId}

Response:
{
  "success": true,
  "data": [
    {
      "id": "payment-1",
      "consultationId": "consultation-123",
      "amount": 50.00,
      "status": "SUCCEEDED",
      "createdAt": "2024-01-15T10:30:00"
    }
  ],
  "count": 1
}
```

#### 4. Request Refund
```
POST /api/v1/payments/{paymentId}/refund

Request Body:
{
  "reason": "requested_by_customer",
  "amount": 50.00,
  "notes": "Cancellation reason"
}

Response:
{
  "id": "payment-id",
  "status": "REFUNDED",
  "refundId": "re_...",
  "success": true
}
```

## Features

### PaymentForm Component

- ✅ Secure card input with Stripe Elements
- ✅ Real-time validation
- ✅ Error handling and display
- ✅ Loading state with spinner
- ✅ Success message display
- ✅ Responsive design for mobile and desktop
- ✅ Accessibility compliant

### PaymentHistory Component

- ✅ Display payment records in table format
- ✅ Filter by payment status
- ✅ Date formatting
- ✅ Refund request functionality
- ✅ Status badges with color coding
- ✅ Loading and error states
- ✅ Empty state handling
- ✅ Responsive table design

## Styling

### CSS Classes Available

#### PaymentForm

- `.payment-form-container` - Main container
- `.payment-form` - Form element
- `.form-group` - Form group wrapper
- `.error-message` - Error display
- `.success-message` - Success display
- `.submit-button` - Submit button

#### PaymentHistory

- `.payment-history-container` - Main container
- `.payments-table-wrapper` - Table wrapper
- `.payments-table` - Table element
- `.badge` - Status badge
- `.badge-success` - Success status
- `.badge-pending` - Pending status
- `.badge-danger` - Failed status
- `.badge-info` - Refunded status

## Error Handling

The components handle the following error scenarios:

1. **Network Errors** - Display connection error message
2. **Payment Failures** - Display Stripe error message
3. **Validation Errors** - Display form validation errors
4. **Backend Errors** - Display API error response
5. **Timeout Errors** - Display timeout message

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimization

- Lazy loading of Stripe.js
- Memoization of components
- Debounced form submissions
- Optimized re-renders

## Security Considerations

1. **No Card Data Handling**
   - Card data is handled by Stripe Elements
   - PCI DSS compliance ensured

2. **API Key Protection**
   - Publishable key used in frontend
   - Secret key never exposed

3. **HTTPS Only**
   - Always use HTTPS in production
   - Secure communication with backend

4. **Validation**
   - Client-side validation
   - Server-side validation required

## Testing

### Unit Testing Example

```javascript
import { render, screen } from '@testing-library/react';
import PaymentForm from './PaymentForm';

test('renders payment form', () => {
  render(
    <PaymentForm
      consultationId="test-1"
      patientId="patient-1"
      doctorId="doctor-1"
      amount={50}
    />
  );
  
  expect(screen.getByText(/Payment Form/i)).toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Stripe not loading
```
Error: Stripe is not defined
Solution: Ensure stripePromise is created before rendering components
```

### Issue: Payment button disabled
```
Problem: Submit button remains disabled
Solution: Check if Stripe Elements are loaded properly
```

### Issue: CORS error
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution: Configure CORS on backend payment service
```

### Issue: PaymentMethodId undefined
```
Error: paymentMethodId is required
Solution: Ensure CardElement is properly mounted and filled
```

## Advanced Usage

### Custom Error Handler

```javascript
const handleError = (error) => {
  if (error.includes('timeout')) {
    // Handle timeout
  } else if (error.includes('declined')) {
    // Handle card declined
  }
};

<PaymentForm
  // ... other props
  onError={handleError}
/>
```

### Customizing Appearance

```javascript
const cardOptions = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px'
    }
  }
};
```

## Documentation

- [Stripe React Documentation](https://stripe.com/docs/stripe-js/react)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js/elements)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)

## Support

For issues or questions, refer to:
- Backend Payment Service Documentation
- Stripe Developer Dashboard
- Project README files

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Status:** ✅ Ready for Production
