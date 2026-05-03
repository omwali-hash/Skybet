const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Sandbox Credentials
const consumerKey = 'ftOrRdNHlsg95bkcB13CjHJpQjx6SlDhZdmY5wIopaPmnnGz';
const consumerSecret = 'U5ReD6AUJVR7J6TTiToagCLSyyijZ0H07unDM56EwyTRtXYkndKMoJ9wmjXMn7Os';

// Safaricom Sandbox Default Shortcode & Passkey
const shortCode = '174379';
const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

let token = null;
let tokenExpiry = null;

// Function to get the OAuth Token
async function getToken() {
    if (token && tokenExpiry && Date.now() < tokenExpiry) {
        return token;
    }
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    try {
        const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });
        token = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
        return token;
    } catch (error) {
        console.error('Error getting token details:', error.response ? JSON.stringify(error.response.data) : error.message);
        throw error;
    }
}

// Endpoint to trigger STK Push
app.post('/api/stkpush', async (req, res) => {
    try {
        const { phone, amount } = req.body;
        
        // Format phone number to 254xxxxxxxxx
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
        if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);
        if (!formattedPhone.startsWith('254')) formattedPhone = '254' + formattedPhone;

        const accessToken = await getToken();
        
        // Generate Timestamp and Password
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

        const payload = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.floor(amount),
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: 'https://mydomain.com/path', 
            AccountReference: 'SkyBet',
            TransactionDesc: 'Deposit to SkyBet'
        };

        const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        console.log('STK Push Request Successful:', response.data);
        res.json({ success: true, data: response.data });

    } catch (error) {
        console.error('STK Push Error:', error.response ? JSON.stringify(error.response.data) : error.message);
        res.status(500).json({ success: false, error: error.response ? error.response.data : 'Server error' });
    }
});

// Endpoint to simulate withdrawal
app.post('/api/withdraw', async (req, res) => {
    try {
        const { phone, amount } = req.body;
        console.log(`Withdrawal request: ${amount} to ${phone}`);
        
        // Simulating B2C success
        res.json({ 
            success: true, 
            data: {
                ConversationID: "AG_" + Math.random().toString(36).substring(7),
                ResponseDescription: "Accept the service request successfully."
            } 
        });
    } catch (error) {
        console.error('Withdrawal Error:', error.message);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`M-Pesa Backend running on http://localhost:${PORT}`);
});
