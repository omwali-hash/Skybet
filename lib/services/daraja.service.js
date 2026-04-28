// lib/services/daraja.service.js
import axios from 'axios';

class DarajaService {
  constructor() {
    this.baseURL = process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessCode = process.env.MPESA_BUSINESS_CODE;
    this.onlinePasskey = process.env.MPESA_ONLINE_PASSKEY;
    this.initiatorName = process.env.MPESA_INITIATOR_NAME;
    this.initiatorPassword = process.env.MPESA_INITIATOR_PASSWORD;
  }

  /**
   * Get OAuth Access Token
   */
  async getAccessToken() {
    try {
      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Token generation error:', error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  /**
   * Initiate STK Push (Lipa Na M-PESA Online)
   */
  async initiateSTKPush(phoneNumber, amount, reference, description = 'SkyBet Deposit') {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      // Ensure phone number is in correct format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.businessCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(amount),
          PartyA: formattedPhone,
          PartyB: this.businessCode,
          PhoneNumber: formattedPhone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: reference,
          TransactionDesc: description
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        merchantRequestID: response.data.MerchantRequestID,
        checkoutRequestID: response.data.CheckoutRequestID
      };
    } catch (error) {
      console.error('STK Push error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate payment');
    }
  }

  /**
   * Query Payment Status
   */
  async queryPaymentStatus(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.businessCode,
          CheckoutRequestID: checkoutRequestId,
          Password: password,
          Timestamp: timestamp
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
      console.error('Query payment status error:', error.message);
      throw new Error('Failed to query payment status');
    }
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   */
  formatPhoneNumber(phone) {
    let formatted = phone.toString();
    
    // Remove common prefixes
    formatted = formatted.replace(/^0/, ''); // Remove leading 0
    formatted = formatted.replace(/^\+/, ''); // Remove +
    
    // Add country code if not present
    if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    
    return formatted;
  }

  /**
   * Generate timestamp in format YYYYMMDDHHmmss
   */
  generateTimestamp() {
    const date = new Date();
    return date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');
  }

  /**
   * Generate password (base64 of BusinessCode + OnlinePassKey + Timestamp)
   */
  generatePassword(timestamp) {
    const combined = this.businessCode + this.onlinePasskey + timestamp;
    return Buffer.from(combined).toString('base64');
  }

  /**
   * Initiate B2C Payment (Withdrawal)
   */
  async initiateB2CPayment(phoneNumber, amount, remarks = 'SkyBet Withdrawal') {
    try {
      const accessToken = await this.getAccessToken();
      
      // Ensure phone number is in correct format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Generate unique command ID
      const commandID = 'BusinessPayment';
      const occasion = 'Withdrawal';
      
      const response = await axios.post(
        `${this.baseURL}/mpesa/b2c/v1/paymentrequest`,
        {
          InitiatorName: this.initiatorName,
          SecurityCredential: this.initiatorPassword,
          CommandID: commandID,
          Amount: Math.round(amount),
          PartyA: this.businessCode,
          PartyB: formattedPhone,
          Remarks: remarks,
          QueueTimeOutURL: process.env.MPESA_B2C_QUEUE_TIMEOUT_URL,
          ResultURL: process.env.MPESA_B2C_RESULT_URL,
          Occasion: occasion
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        conversationID: response.data.ConversationID,
        originatorConversationID: response.data.OriginatorConversationID
      };
    } catch (error) {
      console.error('B2C Payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate withdrawal');
    }
  }

  /**
   * Query B2C Transaction Status
   */
  async queryB2CTransactionStatus(conversationID) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseURL}/mpesa/b2c/v1/querytransactionstatus`,
        {
          Initiator: this.initiatorName,
          SecurityCredential: this.initiatorPassword,
          CommandID: 'TransactionStatusQuery',
          TransactionID: conversationID,
          PartyA: this.businessCode,
          IdentifierType: '4',
          ResultURL: process.env.MPESA_B2C_RESULT_URL,
          QueueTimeOutURL: process.env.MPESA_B2C_QUEUE_TIMEOUT_URL,
          Remarks: 'Status Query'
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
      console.error('B2C Query error:', error.message);
      throw new Error('Failed to query withdrawal status');
    }
  }

  /**
   * Verify M-Pesa callback signature
   */
  verifyCallbackSignature(payload, signature) {
    // This would involve RSA verification in production
    // For now, we'll implement basic validation
    return true; // TODO: Implement proper signature verification
  }
}

export default new DarajaService();
