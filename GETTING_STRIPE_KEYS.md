# Getting Stripe API Keys - Complete Guide

## Table of Contents
1. [Creating Stripe Account](#creating-stripe-account)
2. [Getting API Keys](#getting-api-keys)
3. [Setting up Webhooks](#setting-up-webhooks)
4. [Testing Keys](#testing-keys)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Creating Stripe Account

### Step 1: Sign Up

1. Visit → https://dashboard.stripe.com/register
2. Choose your account type:
   - Individual
   - Business
3. Fill in your details:
   - Email
   - Password (strong password recommended)
   - Country/Region
   - Business name (if applicable)

### Step 2: Email Verification

1. Check your email inbox
2. Click the verification link
3. Confirm you're not a robot (CAPTCHA)
4. You're now registered

### Step 3: Complete Your Profile

1. Log in to dashboard
2. Fill out your business information:
   - Business name
   - Business type
   - Business website (optional)
   - Phone number
3. Add bank details (for payouts)
4. Accept Stripe agreement

### Step 4: Verify Your Identity

Follow Stripe's verification process:
- Business registration information
- Owner/representative details
- Sometimes requires document verification

---

## Getting API Keys

### Locating Your Keys

1. **Log in** to Stripe Dashboard: https://dashboard.stripe.com

2. **In the left sidebar**, click on **"Developers"**

3. **Select "API keys"** from the dropdown

4. You'll see your keys in the **"Standard keys"** section

### Understanding Your Keys

#### Test Mode Keys (Development)
Start with `pk_test_` and `sk_test_`

**Publishable Key (pk_test_...)**
- Used in client-side code (safe to expose)
- Used in frontend JavaScript
- Used for Stripe Elements
- Starts with: `pk_test_`

**Secret Key (sk_test_...)**  
- Used in backend/server code (KEEP SECRET!)
- Never share or commit to Git
- Used for API calls to Stripe
- Starts with: `sk_test_`

#### Live Mode Keys (Production)
Start with `pk_live_` and `sk_live_`
- Only use after testing thoroughly
- Live transactions will occur
- Real money involved

### Step-by-Step: Copy Your Keys

1. **Viewing Keys:**
   - Click "Reveal test key" to show secret key
   - Or toggle between "Publishable" and "Secret"

2. **Copying Keys:**
   - Click the copy icon next to each key
   - Or manually select and copy

3. **Store Securely:**
```bash
# Create .env file
cat > .env << 'EOF'
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_API_KEY=sk_test_YOUR_SECRET_KEY_HERE
EOF

# Protect the file
chmod 600 .env
```

---

## Setting up Webhooks

### What are Webhooks?

Webhooks are HTTP requests that Stripe sends to your server when events occur (e.g., payment succeeded, refund issued).

### Step 1: Access Webhooks Dashboard

1. Go to Stripe Dashboard
2. Click **"Developers"** → **"Webhooks"**
3. Click **"Add endpoint"**

### Step 2: Configure Webhook Endpoint

**Endpoint Settings:**

| Field | Value |
|-------|-------|
| Endpoint URL | https://your-domain.com/api/v1/webhooks/stripe |
| API Version | Latest (default is fine) |

**Local Development (using ngrok):**

If testing locally:
```bash
# Install ngrok
brew install ngrok

# Start ngrok
ngrok http 8004

# Use the provided URL
# https://xxxxx-xx-xxx-xxx-xx.ngrok.io/api/v1/webhooks/stripe
```

### Step 3: Select Events

Choose which events to listen for:

**Recommended Events:**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment cancelled
- `charge.refunded` - Refund issued
- `charge.dispute.created` - Dispute started

**Click Events:**
1. Search for event names
2. Check the boxes for desired events
3. Click **"Add events"** to add more

### Step 4: Create Endpoint

1. Click **"Create endpoint"**
2. Webhook is now created and active
3. Copy the **Signing secret** (starts with `whsec_`)

### Step 5: Store Webhook Secret

```bash
# Add to .env
echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE" >> .env
```

### Step 6: Test Webhook

1. In Webhooks dashboard, click your endpoint
2. Scroll to "Events to endpoint"
3. Click on any event
4. Click **"Resend"** to test

Check server logs for webhook receipt.

---

## Test Stripe Keys Example

### Sample Keys (Do Not Use)

```
# Test Mode (Sandbox)
Publishable Key: pk_test_51234567890abcdefghijklmnopqrstuvwxyz
Secret Key: sk_test_51234567890abcdefghijklmnopqrstuvwxyz
Webhook Secret: whsec_test_51234567890abcdefghijklmnopqrstuvwxyz

# Your actual keys will look like this
```

### Environment Variables Setup

**Backend (.env):**
```bash
STRIPE_API_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

**Frontend (.env):**
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

---

## Testing Your Keys

### Using cURL

```bash
# Test Secret Key validity
curl https://api.stripe.com/v1/account \
  -H "Authorization: Bearer sk_test_YOUR_KEY"

# Expected Response:
# {
#   "object": "account",
#   "id": "acct_xxxxx",
#   "type": "standard",
#   ...
# }
```

### Using Postman

1. Open Postman
2. Create new request
3. Set method to **GET**
4. URL: `https://api.stripe.com/v1/account`
5. Go to **Authorization** tab
6. Select **Basic Auth**
7. Username: Your `sk_test_key`
8. Password: (leave blank)
9. Click **Send**

### Using Java

```java
import com.stripe.Stripe;

public class StripeTest {
    public static void main(String[] args) {
        Stripe.apiKey = "sk_test_YOUR_KEY";
        
        try {
            Account account = Account.retrieve();
            System.out.println("Account retrieved: " + account.getId());
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

### Using JavaScript

```javascript
// In browser console or Node.js
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');

// This won't validate the key directly
// But you can try creating a payment method
```

---

## Test Cards for Development

### Every Scenario Has a Test Card

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Card Declined:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**Authentication Required (3D Secure):**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

**Insufficient Funds:**
- Card: `4000 0000 0000 9995`

**Lost Card:**
- Card: `4000 0000 0000 9987`

**Stolen Card:**
- Card: `4000 0000 0000 9979`

### International Test Cards

**UK Visa:**
`4000 0566 5566 5556`

**France Amex:**
`3714 003052 84067`

**Australia Visa:**
`4000 0566 5566 5556`

---

## Moving to Production

### Before Going Live

**Checklist:**
- [ ] Complete Stripe identity verification
- [ ] Complete webhook setup with production URL
- [ ] Test full payment flow with test cards
- [ ] Implement error handling
- [ ] Review security practices
- [ ] Set up monitoring/alerts
- [ ] Prepare backup/rollback plan

### Switching to Live Keys

1. In Stripe Dashboard, toggle **"Production mode"** (top right)
2. Replace test keys with live keys
3. Use live key format: `pk_live_` and `sk_live_`

```bash
# Update .env for production
STRIPE_API_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_live_YOUR_LIVE_WEBHOOK_SECRET
```

### Testing in Production

1. Process small test transaction ($0.50)
2. Verify payment appears in Stripe Dashboard
3. Confirm successful webhook delivery
4. Test refund process

---

## Security Best Practices

### For Backend (Secret Keys)

❌ **DON'T:**
```bash
# Don't hardcode keys
const stripeKey = "sk_test_xxxxx"; // BAD!

# Don't commit to Git
git add .env # Problem if .env has keys

# Don't log keys
console.log("API Key: " + secretKey); // BAD!
```

✅ **DO:**
```bash
# Use environment variables
process.env.STRIPE_API_KEY

# Add to .gitignore
echo ".env" >> .gitignore

# Use secure storage
# - AWS Secrets Manager
# - HashiCorp Vault
# - Azure Key Vault
```

### For Frontend (Publishable Keys)

⚠️ **PUBLISHABLE KEYS:**
- Safe to expose (they're meant for frontend)
- Still should not be committed to version control
- Use environment variables for consistency

```javascript
// OK (publishable key in frontend)
const stripe = Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Publishable keys cannot be used to charge customers
// They can only create payment methods
```

### Access Control

1. **Restrict API key usage**
   - Stripe Dashboard → Settings → API keys
   - Set IP restrictions if needed

2. **Rotate keys regularly**
   - Generate new keys
   - Update applications
   - Delete old keys

3. **Monitor API activity**
   - Stripe Dashboard → Logs
   - Check for suspicious activity

### Webhook Security

1. **Verify signatures** (implemented in code)
```java
// Verify webhook signature
Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
```

2. **Use HTTPS only**
   - Never use HTTP for webhooks
   - Use valid SSL certificate

3. **Retry mechanism**
   - Stripe retries failed webhooks
   - Implement idempotent handling

---

## Troubleshooting

### Problem: "Invalid API Key"

**Causes:**
- Typo in key
- Using wrong key (publishable vs secret)
- Test key in production
- Missing environment variable

**Solution:**
```bash
# Verify key format
echo $STRIPE_API_KEY | head -c 20  # Should show sk_test_ or sk_live_

# Get fresh key from Dashboard
# Regenerate if compromised
```

### Problem: Webhook Not Received

**Causes:**
- Wrong endpoint URL
- Firewall blocking requests
- Invalid SSL certificate
- Endpoint timeout

**Solution:**
```bash
# Check endpoint status
# Stripe Dashboard → Webhooks → your endpoint

# Use ngrok for local testing
ngrok http 8004
# Add URL to Stripe webhook settings

# Test webhook manually
# Click on event → Resend
```

### Problem: Test Card Declined

**Causes:**
- Using production URL with test card
- Invalid expiry/CVC
- Using live keys with test card

**Solution:**
- Verify you're in test mode
- Use correct test card details
- Check API key format

### Problem: Authentication Required

**What it means:**
- Customer needs to verify via 3D Secure
- Or confirm identity

**Solution:**
```java
if ("requires_action".equals(paymentIntent.getStatus())) {
    // Redirect user to Stripe authentication URL
    String clientSecret = paymentIntent.getClientSecret();
    // Pass to frontend for 3D Secure
}
```

---

## Useful Resources

### Official Documentation
- Stripe Dashboard: https://dashboard.stripe.com
- API Reference: https://stripe.com/docs/api
- Testing Guide: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks

### Test Data
- Test Cards: https://stripe.com/docs/testing#international-cards
- Test Phone/Email: https://stripe.com/docs/testing#email-phone

### Support
- Stripe Support: https://support.stripe.com
- Community: https://stripe.com/community

---

## Quick Reference Cheat Sheet

```bash
# Get your test keys
# 1. Go to: https://dashboard.stripe.com
# 2. Click: Developers → API keys
# 3. Copy: Publishable and Secret keys
# 4. Store in: .env file

# Test webhook setup
# 1. Go to: Developers → Webhooks
# 2. Click: Add endpoint
# 3. Set URL: https://your-domain.com/webhooks/stripe
# 4. Select events: payment_intent.succeeded, etc.
# 5. Copy: Signing secret
# 6. Test: Click event → Resend

# Validate keys
curl https://api.stripe.com/v1/account \
  -H "Authorization: Bearer YOUR_SECRET_KEY"

# Use test card
# Card: 4242 4242 4242 4242
# Expiry: 12/25
# CVC: 123
```

---

## Environment Variables Template

Create a `.env` file:

```bash
# ====================================
# STRIPE CONFIGURATION
# ====================================

# Test Mode Keys (for development)
STRIPE_API_KEY=sk_test_YOUR_TEST_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_TEST_WEBHOOK_SECRET

# Production Keys (when ready)
# STRIPE_API_KEY=sk_live_YOUR_LIVE_SECRET_KEY
# STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
# STRIPE_WEBHOOK_SECRET=whsec_live_YOUR_LIVE_WEBHOOK_SECRET

# ====================================
# PAYMENT CONFIGURATION
# ====================================
PAYMENT_SUCCESS_URL=http://localhost:3000/payment/success
PAYMENT_FAILURE_URL=http://localhost:3000/payment/failure

# ====================================
# DATABASE CONFIGURATION
# ====================================
MONGO_URI=mongodb://localhost:27017/healthcare_payments

# ====================================
# APPLICATION CONFIGURATION
# ====================================
SPRING_PROFILES_ACTIVE=dev
JAVA_OPTS=-Xmx512m -Xms256m
```

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
**Status:** ✅ Complete Guide
