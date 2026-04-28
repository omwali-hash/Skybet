// pages/api/wallet/deposit.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'
import { initiateMpesaPayment } from '@/lib/mpesa'
import { checkSelfExclusion, checkDailyDepositLimit } from '@/lib/middleware/responsibleGambling'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error } = authMiddleware(req)
  if (error) {
    return res.status(401).json({ error })
  }

  try {
    const { amount, phone } = req.body

    if (!amount || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Amount and phone number are required'
      })
    }

    if (amount < 10) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Minimum deposit is KES 10'
      })
    }

    // Check self-exclusion
    const exclusionCheck = await checkSelfExclusion(user.userId)
    if (!exclusionCheck.allowed) {
      return res.status(403).json({
        error: 'Account restricted',
        message: exclusionCheck.reason
      })
    }

    // Check daily deposit limit
    const limitCheck = await checkDailyDepositLimit(user.userId, amount)
    if (!limitCheck.allowed) {
      return res.status(400).json({
        error: 'Deposit limit exceeded',
        message: limitCheck.reason
      })
    }

    // Generate reference
    const reference = `SKYBET-${user.userId}-${Date.now()}`

    // Initiate M-Pesa payment
    const mpesaResponse = await initiateMpesaPayment(phone, amount, reference)

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.userId,
        amount,
        type: 'deposit',
        status: 'pending',
        reference,
        phone
      }
    })

    res.status(200).json({
      message: 'Payment initiated',
      data: {
        transactionId: transaction.id,
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        reference
      }
    })
  } catch (error) {
    console.error('Deposit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}