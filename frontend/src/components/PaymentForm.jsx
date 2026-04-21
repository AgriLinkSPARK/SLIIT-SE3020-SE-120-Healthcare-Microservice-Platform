import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import './PaymentForm.css';

// Prevent telemetry requests to r.stripe.com in restricted/ad-blocked networks when supported.
if (typeof loadStripe.setLoadParameters === 'function') {
  loadStripe.setLoadParameters({ advancedFraudSignals: false });
}

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const paymentServiceBaseUrl = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8004';
const paymentApi = axios.create({
  baseURL: paymentServiceBaseUrl,
  timeout: 15000,
});
const isPlaceholderStripeKey = !stripePublishableKey
  || /YOUR_PUBLISHABLE_KEY|REPLACE_WITH_YOUR_PUBLISHABLE_KEY|dummy/i.test(stripePublishableKey);
const stripePromise = !isPlaceholderStripeKey ? loadStripe(stripePublishableKey) : null;

const CARD_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      iconColor: '#c6cccc',
      color: '#555',
      fontWeight: 500,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': { color: '#fce883' },
      '::placeholder': { color: '#87bbfd' },
    },
    invalid: {
      iconColor: '#ffc7ee',
      color: '#ffc7ee',
    },
  },
};

const PaymentFormContent = ({ consultationId, patientId, doctorId, amount, onSuccess, onError, disabled = false }) => {
  const stripe = useStripe();
  const elements = useElements();
  const cardElementRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardReady, setIsCardReady] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(() => (stripePromise ? 'STRIPE' : 'PAYHERE'));
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const isStripeMethod = paymentMethod === 'STRIPE';
  const formattedAmount = Number(amount || 0).toFixed(2);

  useEffect(() => {
    if (!stripePromise && paymentMethod === 'STRIPE') {
      setPaymentMethod('PAYHERE');
    }
  }, [paymentMethod]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (disabled) {
      setErrorMessage('Fill consultation, doctor, and amount details before submitting payment.');
      return;
    }

    if (isStripeMethod && (!stripe || !elements)) {
      setErrorMessage('Stripe is still loading. Please wait a moment and try again.');
      return;
    }

    const cardElement = isStripeMethod ? (cardElementRef.current || elements.getElement(CardElement)) : null;

    if (isStripeMethod && (!cardElement || !isCardReady)) {
      setErrorMessage('Card field is not ready yet. Please wait until it finishes loading.');
      return;
    }

    if (isStripeMethod && !isCardComplete) {
      setErrorMessage('Please complete your card details before submitting.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    setNoticeMessage('');

    try {
      // Step 1: Initiate payment on backend
      const initiateResponse = await paymentApi.post(
        '/api/v1/payments/initiate',
        {
          consultationId,
          patientId,
          doctorId,
          amount,
          currency: 'USD',
          paymentMethod,
          description: `Consultation fee for consultation ${consultationId}`,
          customerEmail: localStorage.getItem('userEmail') || undefined,
          customerName: localStorage.getItem('userName') || undefined,
        }
      );

      if (!initiateResponse.data.success) {
        if (isMountedRef.current) {
          setNoticeMessage(initiateResponse.data.message || 'Payment service is temporarily unavailable. Please try again later.');
        }
        onError?.(initiateResponse.data.message || 'Payment service is temporarily unavailable');
        return;
      }

      const paymentId = initiateResponse.data.id;

      if (!isStripeMethod) {
        const checkoutUrl = initiateResponse.data.checkoutUrl;
        if (!checkoutUrl) {
          throw new Error(initiateResponse.data.message || 'Gateway checkout URL not available');
        }

        if (isMountedRef.current) {
          setSuccessMessage(`${paymentMethod} checkout prepared. Opening payment gateway...`);
        }

        onSuccess?.(initiateResponse.data);
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // Step 2: Create payment method
      const { error, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: localStorage.getItem('userName') || undefined,
          email: localStorage.getItem('userEmail') || undefined,
        },
      });

      if (error) {
        if (isMountedRef.current) {
          setErrorMessage(error.message);
          setIsProcessing(false);
        }
        onError?.(error.message);
        return;
      }

      // Step 3: Confirm payment
      const confirmResponse = await paymentApi.post(
        `/api/v1/payments/${paymentId}/confirm`,
        null,
        { params: { paymentMethodId: stripePaymentMethod.id } }
      );

      if (confirmResponse.data.success) {
        if (isMountedRef.current) {
          setSuccessMessage('Payment processed successfully!');
          setIsCardComplete(false);
        }
        onSuccess?.(confirmResponse.data);
      } else {
        if (isMountedRef.current) {
          setNoticeMessage(confirmResponse.data.message || 'Payment failed');
        }
        onError?.(confirmResponse.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error.code === 'ECONNABORTED'
        ? 'Payment request timed out. Please try again.'
        : (error.response?.data?.message || error.message || 'Payment processing error');
      if (isMountedRef.current) {
        setErrorMessage(errorMsg);
      }
      onError?.(errorMsg);
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form-header">
        <div>
          <span className="section-label">Secure checkout</span>
          <h2>Pay consultation fee</h2>
        </div>
        <span className="secure-badge">{isStripeMethod ? 'Stripe secured' : 'Gateway redirect'}</span>
      </div>

      <div className="payment-summary-card">
        <div className="payment-amount-row">
          <div>
            <span>Amount due</span>
            <strong>${formattedAmount}</strong>
          </div>
          <div className="payment-chip">{paymentMethod.replace('_', ' ')}</div>
        </div>

        <div className="payment-meta-grid">
          <div>
            <span>Consultation</span>
            <strong>{consultationId}</strong>
          </div>
          <div>
            <span>Patient</span>
            <strong>{patientId}</strong>
          </div>
          <div>
            <span>Doctor</span>
            <strong>{doctorId}</strong>
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <div className="error-message" role="alert">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message" role="alert">
          {successMessage}
        </div>
      )}

      {noticeMessage && !errorMessage && (
        <div className="error-message" role="status">
          {noticeMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="payment-method">Payment gateway</label>
          <select
            id="payment-method"
            className="payment-method-select"
            value={paymentMethod}
            onChange={(event) => {
              setPaymentMethod(event.target.value);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            disabled={isProcessing}
          >
            <option value="STRIPE" disabled={!stripePromise}>Stripe (Cards)</option>
            <option value="PAYHERE">PayHere</option>
            <option value="DIALOG_GENIE">Dialog Genie</option>
            <option value="FRIMI">FriMi</option>
            <option value="PAYPAL">PayPal Sandbox</option>
          </select>
        </div>

        {isStripeMethod && (
        <div className="form-group">
          <label htmlFor="card-element">Card details</label>
          <div className="card-element-shell">
            <CardElement
              id="card-element"
              options={CARD_OPTIONS}
              onReady={(element) => {
                cardElementRef.current = element;
                setIsCardReady(true);
              }}
              onChange={(event) => {
                setIsCardComplete(event.complete);
                if (event.error) {
                  setErrorMessage(event.error.message);
                } else {
                  setErrorMessage('');
                }
              }}
            />
          </div>
        </div>
        )}

        <div className="payment-footnote">
          {isStripeMethod
            ? 'Payments are handled by Stripe. Your card data never touches our servers.'
            : 'You will be redirected to the selected payment gateway to complete this transaction securely.'}
        </div>

        <div className="payment-actions">
          <button
            type="submit"
            disabled={
              disabled || isStripeMethod
                ? (!stripe || !elements || !isCardReady || !isCardComplete || isProcessing)
                : isProcessing
            }
            className="submit-button"
          >
            {isProcessing
              ? 'Processing...'
              : isStripeMethod
                ? `Pay $${formattedAmount}`
                : `Continue with ${paymentMethod.replace('_', ' ')}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentForm = ({ consultationId, patientId, doctorId, amount, onSuccess, onError, disabled = false }) => {
  return (
    <Elements stripe={stripePromise || null}>
      <PaymentFormContent
        consultationId={consultationId}
        patientId={patientId}
        doctorId={doctorId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        disabled={disabled}
      />
    </Elements>
  );
};

export default PaymentForm;
