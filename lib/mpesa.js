// lib/mpesa.js
import axios from 'axios'

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET
const BUSINESS_CODE = process.env.MPESA_BUSINESS_CODE
const ONLINE_PASSKEY = process.env.MPESA_ONLINE_PASSKEY
const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox'

const BASE_URL = ENVIRONMENT === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

let accessToken = null
let tokenExpiry = 0

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
    const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    })

    accessToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000)
    return accessToken
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error)
    throw error
  }
}

export async function initiateMpesaPayment(phoneNumber, amount, reference) {
  try {
    const token = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(`${BUSINESS_CODE}${ONLINE_PASSKEY}${timestamp}`).toString('base64')

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: BUSINESS_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(amount),
        PartyA: phoneNumber.replace(/^0/, '254'), // Convert to international format
        PartyB: BUSINESS_CODE,
        PhoneNumber: phoneNumber.replace(/^0/, '254'),
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: reference,
        TransactionDesc: 'SkyBet Deposit'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error)
    throw error
  }
}

export async function checkMpesaStatus(checkoutRequestId) {
  try {
    const token = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(`${BUSINESS_CODE}${ONLINE_PASSKEY}${timestamp}`).toString('base64')

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: BUSINESS_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error) {
    console.error('Error checking M-Pesa status:', error)
    throw error
  }
}

/**
 * Initiate B2C withdrawal (send money to user's M-Pesa)
 * Note: Requires INITIATOR_NAME and INITIATOR_PASSWORD environment variables
 */
export async function initiateB2CWithdrawal(phoneNumber, amount, remarks = 'SkyBet Withdrawal') {
  try {
    const token = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)

    // Security credential is the base64 encoded password
    const initiatorPassword = process.env.MPESA_INITIATOR_PASSWORD
    if (!initiatorPassword) {
      throw new Error('MPESA_INITIATOR_PASSWORD not configured')
    }

    const securityCredential = Buffer.from(initiatorPassword).toString('base64')
    const initiatorName = process.env.MPESA_INITIATOR_NAME || 'testapi'

    const response = await axios.post(
      `${BASE_URL}/mpesa/b2c/v1/paymentrequest`,
      {
        InitiatorName: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: 'BusinessPayment',
        Amount: Math.floor(amount),
        PartyA: BUSINESS_CODE,
        PartyB: phoneNumber.replace(/^0/, '254'),
        Remarks: remarks,
        QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/timeout`,
        ResultURL: process.env.MPESA_RESULT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/withdrawal-result`,
        Occasion: 'Withdrawal'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  } catch (error) {
    console.error('Error initiating B2C withdrawal:', error.response?.data || error.message)
    throw new Error(error.response?.data?.errorMessage || 'Failed to initiate withdrawal')
  }
}