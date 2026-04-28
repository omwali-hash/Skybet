# M-Pesa Daraja Integration Guide

## Overview
This guide explains how to integrate Safaricom's M-Pesa Daraja API with SkyBet for handling payments and withdrawals in Kenya.

---

## TABLE OF CONTENTS
1. [Getting Started](#getting-started)
2. [Sandbox Setup](#sandbox-setup)
3. [API Reference](#api-reference)
4. [Integration Steps](#integration-steps)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

---

## GETTING STARTED

### Prerequisites
1. **Register as a Daraja Developer**
   - Visit: https://developer.safaricom.co.ke
   - Sign up with email and verify

2. **Create an App**
   - Navigate to Dashboard
   - Create new app in Sandbox environment
   - You'll receive:
     - Consumer Key
     - Consumer Secret

3. **Get Your M-Pesa Credentials**
   - Business Short Code (Pochi la Biashara)
   - Online Pass Key
   - Initiator Name
   - Initiator Password

---

## SANDBOX SETUP

### Step 1: Get Sandbox Credentials
```
Daraja Sandbox: https://sandbox.safaricom.co.ke

Example Credentials (for testing):
- Consumer Key: xxxxxxxxxxxxxxxx
- Consumer Secret: xxxxxxxxxxxxxxxx
- Business Short Code: 174379
- Online Pass Key: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
- Test Phone: 254708374149
```

### Step 2: Environment Configuration (.env)
```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_CODE=174379  # Sandbox: 174379, Production: your_business_code
MPESA_ONLINE_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_INITIATOR_PASSWORD=your_initiator_password
MPESA_ENVIRONMENT=sandbox  # sandbox or production
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_TIMEOUT_URL=https://yourdomain.com/api/mpesa/timeout
```

---

## API REFERENCE

### 1. OAuth Token - Get Access Token

**Endpoint:** `POST https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`

**Headers:**
```
Authorization: Basic base64(consumer_key:consumer_secret)
Content-Type: application/json
```

**Response:**
```json
{
  "access_token": "xxxxxxxxxxx",
  "expires_in": "3599"
}
```

**Code Example (Node.js):**
```javascript
const axios = require('axios');
const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

async function getAccessToken() {
  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Token error:', error);
  }
}
```

---

### 2. STK Push (Lipa Na M-PESA Online)

**Endpoint:** `POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`

**Purpose:** Send M-Pesa payment prompt to user's phone

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "BusinessShortCode": "174379",
  "Password": "base64(BusinessShortCode + OnlinePassKey + Timestamp)",
  "Timestamp": "20260421120000",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": 100,
  "PartyA": "254708374149",
  "PartyB": "174379",
  "PhoneNumber": "254708374149",
  "CallBackURL": "https://yourdomain.com/api/mpesa/callback",
  "AccountReference": "SkyBet-Deposit-12345",
  "TransactionDesc": "SkyBet Deposit"
}
```

**Response (Success):**
```json
{
  "MerchantRequestID": "16813-1590513057-1",
  "CheckoutRequestID": "ws_CO_DMZ_12321",
  "ResponseCode": "0",
  "ResponseDescription": "Success. Request accepted for processing",
  "CustomerMessage": "Success. Request accepted for processing"
}
```

**Code Example:**
```javascript
const generateTimestamp = () => {
  const date = new Date();
  return date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');
};

const generatePassword = (shortCode, passkey, timestamp) => {
  const combined = shortCode + passkey + timestamp;
  return Buffer.from(combined).toString('base64');
};

async function initiateSTKPush(accessToken, amount, phoneNumber, reference) {
  const timestamp = generateTimestamp();
  const password = generatePassword(BUSINESS_CODE, ONLINE_PASSKEY, timestamp);

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: BUSINESS_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: BUSINESS_CODE,
        PhoneNumber: phoneNumber,
        CallBackURL: CALLBACK_URL,
        AccountReference: reference,
        TransactionDesc: 'SkyBet Deposit'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('STK Push error:', error);
  }
}
```

---

### 3. Query Payment Status

**Endpoint:** `POST https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query`

**Purpose:** Check the status of a payment request

**Request Body:**
```json
{
  "BusinessShortCode": "174379",
  "CheckoutRequestID": "ws_CO_DMZ_12321",
  "Password": "base64(BusinessShortCode + OnlinePassKey + Timestamp)",
  "Timestamp": "20260421120000"
}
```

**Response:**
```json
{
  "ResponseCode": "0",
  "ResponseDescription": "The service request has been accepted successfully",
  "MerchantRequestID": "16813-1590513057-1",
  "CheckoutRequestID": "ws_CO_DMZ_12321",
  "ResultCode": "0",
  "ResultDesc": "The service request has been accepted successfully."
}
```

---

### 4. Payment Callback (Webhook)

**What You'll Receive:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "16813-1590513057-1",
      "CheckoutRequestID": "ws_CO_DMZ_12321",
      "ResultCode": 0,
      "ResultDesc": "The service request has been accepted successfully",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 100.00 },
          { "Name": "MpesaReceiptNumber", "Value": "LHG31ZL60QP" },
          { "Name": "TransactionDate", "Value": 20260421120545 },
          { "Name": "PhoneNumber", "Value": 254708374149 }
        ]
      }
    }
  }
}
```

**Handling the Callback (Node.js):**
```javascript
app.post('/api/mpesa/callback', (req, res) => {
  const body = req.body.Body.stkCallback;
  
  // Log the callback
  console.log('M-Pesa Callback:', body);

  if (body.ResultCode === 0) {
    // Payment successful
    const metadata = body.CallbackMetadata.Item;
    const amount = metadata.find(i => i.Name === 'Amount').Value;
    const receipt = metadata.find(i => i.Name === 'MpesaReceiptNumber').Value;
    const phone = metadata.find(i => i.Name === 'PhoneNumber').Value;

    // Credit user wallet
    creditUserWallet(phone, amount, receipt);
  } else {
    // Payment failed
    console.log('Payment failed:', body.ResultDesc);
  }

  res.json({ ResultCode: 0 }); // Acknowledge receipt
});
```

---

### 5. B2C Payment (Withdrawal)

**Endpoint:** `POST https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest`

**Purpose:** Send money to user's M-Pesa account

**Request Body:**
```json
{
  "InitiatorName": "your_initiator_name",
  "SecurityCredential": "encrypted_password",
  "CommandID": "BusinessPayment",
  "Amount": 100,
  "PartyA": "174379",
  "PartyB": "254708374149",
  "Remarks": "SkyBet Withdrawal",
  "QueueTimeOutURL": "https://yourdomain.com/api/mpesa/timeout",
  "ResultURL": "https://yourdomain.com/api/mpesa/withdrawal-callback",
  "Occasion": "Withdrawal"
}
```

**Note:** B2C requires `SecurityCredential` which is encrypted using RSA encryption.

---

## INTEGRATION STEPS

### Step 1: Install Dependencies
```bash
npm install axios dotenv express body-parser
```

### Step 2: Create Daraja Service
```javascript
// services/daraja.service.js
class DarajaService {
  async getAccessToken() { }
  async initiateSTKPush(phone, amount, reference) { }
  async queryPaymentStatus(checkoutRequestId) { }
  async initiateWithdrawal(phone, amount) { }
}

module.exports = new DarajaService();
```

### Step 3: Setup Callback Endpoint
```javascript
// routes/mpesa.routes.js
router.post('/callback', mpesaController.handleCallback);
router.post('/timeout', mpesaController.handleTimeout);
router.post('/withdrawal-callback', mpesaController.handleWithdrawalCallback);
```

### Step 4: Database Logging
```javascript
// Log all M-Pesa transactions
await MpesaCallback.create({
  phone,
  amount,
  mpesaReceiptId: receipt,
  status: 'success',
  payload: fullCallbackData
});
```

---

## TESTING

### Sandbox Testing Phone Numbers
```
254708374149  (Valid test number)
254718374149  (Another test number)
```

### Simulate Payment Success
1. Initiate STK Push with test phone number
2. Check inbox for M-Pesa prompt
3. Enter M-Pesa PIN to complete payment
4. Callback will be sent to your endpoint

### Testing Without Real Phone
Use Postman to simulate callback:

```json
POST https://yourdomain.com/api/mpesa/callback

{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "16813-1590513057-1",
      "CheckoutRequestID": "ws_CO_DMZ_12321",
      "ResultCode": 0,
      "ResultDesc": "The service request has been accepted successfully",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 100 },
          { "Name": "MpesaReceiptNumber", "Value": "LHG31ZL60QP" },
          { "Name": "TransactionDate", "Value": 20260421120545 },
          { "Name": "PhoneNumber", "Value": 254708374149 }
        ]
      }
    }
  }
}
```

---

## PRODUCTION DEPLOYMENT

### Changes from Sandbox to Production

1. **Environment Variables**
```env
MPESA_ENVIRONMENT=production
MPESA_BUSINESS_CODE=your_production_business_code
MPESA_ONLINE_PASSKEY=your_production_passkey
```

2. **Endpoint URLs**
```
Sandbox: https://sandbox.safaricom.co.ke
Production: https://api.safaricom.co.ke
```

3. **Testing**
- Complete end-to-end testing with real M-Pesa accounts
- Verify callback URLs are live and accessible
- Test both success and failure scenarios

4. **Security**
- Use strong encryption for credentials
- Enable HTTPS
- Implement request signing
- Set up monitoring for failed transactions

5. **Go-Live Checklist**
- [ ] Daraja credentials updated for production
- [ ] Callback URLs accessible and validated
- [ ] Database backups configured
- [ ] Error handling and retry logic tested
- [ ] Monitoring and alerting setup
- [ ] Customer support ready for issues

---

## COMMON ERRORS & TROUBLESHOOTING

| Error Code | Meaning | Solution |
|-----------|---------|----------|
| 400 | Bad Request | Check request format and parameters |
| 401 | Unauthorized | Verify consumer key/secret and token |
| 404 | Not Found | Check endpoint URL |
| 500 | Server Error | Contact Safaricom support |
| ResultCode: 1 | Payment rejected | User rejected prompt or insufficient funds |
| ResultCode: 1032 | Request timeout | Check callback URL is accessible |

---

## RESOURCES

- **Daraja Developer Portal:** https://developer.safaricom.co.ke
- **API Documentation:** https://developer.safaricom.co.ke/documentation
- **Sandbox Playground:** https://sandbox.safaricom.co.ke
- **Support Email:** developer@safaricom.co.ke

---

**Last Updated:** April 21, 2026
**Version:** 1.0
