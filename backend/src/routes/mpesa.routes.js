// backend/src/routes/mpesa.routes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const walletService = require('../services/wallet.service');
const authService = require('../services/auth.service');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * M-Pesa Payment Callback
 */
router.post('/callback', async (req, res) => {
  try {
    const body = req.body.Body?.stkCallback;
    
    if (!body) {
      return res.json({ ResultCode: 0 });
    }

    console.log('M-Pesa Callback:', body);

    // Log callback for audit
    await prisma.mpesaCallback.create({
      data: {
        phone: body.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value?.toString() || '',
        amount: body.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value || 0,
        mpesaReceiptId: body.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '',
        status: body.ResultCode === 0 ? 'success' : 'failed',
        payload: body
      }
    });

    if (body.ResultCode === 0) {
      // Payment successful
      const metadata = body.CallbackMetadata.Item;
      const amount = parseFloat(metadata.find(i => i.Name === 'Amount')?.Value);
      const receipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const phone = metadata.find(i => i.Name === 'PhoneNumber')?.Value?.toString();

      // Find user by phone
      const user = await prisma.user.findUnique({
        where: { phone: darajaService.formatPhoneNumber(phone) }
      });

      if (user) {
        // Credit wallet
        await walletService.creditWallet(
          user.id,
          amount,
          receipt,
          `M-Pesa deposit - Receipt: ${receipt}`
        );

        console.log(`✓ Deposited KES ${amount} to user ${user.phone}`);
      }
    }

    res.json({ ResultCode: 0 });
  } catch (error) {
    console.error('Callback error:', error);
    res.json({ ResultCode: 0 }); // Always return 0 to acknowledge
  }
});

/**
 * M-Pesa Timeout
 */
router.post('/timeout', (req, res) => {
  console.log('M-Pesa Timeout:', req.body);
  res.json({ ResultCode: 0 });
});

/**
 * M-Pesa Withdrawal Callback
 */
router.post('/withdrawal-callback', async (req, res) => {
  try {
    const body = req.body.Result;
    console.log('Withdrawal callback:', body);

    // Handle withdrawal result
    if (body.ResultCode === 0) {
      console.log('✓ Withdrawal successful');
    } else {
      console.log('✗ Withdrawal failed:', body.ResultDesc);
    }

    res.json({ ResultCode: 0 });
  } catch (error) {
    console.error('Withdrawal callback error:', error);
    res.json({ ResultCode: 0 });
  }
});

module.exports = router;
