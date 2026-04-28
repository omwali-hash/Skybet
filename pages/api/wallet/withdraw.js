// pages/api/wallet/withdraw.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'
import { initiateB2CWithdrawal } from '@/lib/mpesa'
import walletService from '@/lib/services/wallet.service'

const MIN_WITHDRAWAL = 50
const MAX_WITHDRAWAL = 50000
const DAILY_WITHDRAWAL_LIMIT = 100000

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

    // Validation
    if (!amount || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Amount and phone number are required'
      })
    }

    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: `Minimum withdrawal is KES ${MIN_WITHDRAWAL}`
      })
    }

    if (amount > MAX_WITHDRAWAL) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: `Maximum withdrawal is KES ${MAX_WITHDRAWAL}`
      })
    }

    // Check user balance
    const wallet = await walletService.getWallet(user.userId)
    if (wallet.balance < amount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: 'You do not have enough balance for this withdrawal'
      })
    }

    // Check daily withdrawal limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayWithdrawals = await prisma.transaction.aggregate({
      where: {
        userId: user.userId,
        type: 'withdrawal',
        status: { in: ['pending', 'completed'] },
        createdAt: { gte: today }
      },
      _sum: {
        amount: true
      }
    })

    const totalToday = Math.abs(todayWithdrawals._sum.amount || 0)
    if (totalToday + amount > DAILY_WITHDRAWAL_LIMIT) {
      return res.status(400).json({
        error: 'Daily limit exceeded',
        message: `Daily withdrawal limit is KES ${DAILY_WITHDRAWAL_LIMIT}. You have withdrawn KES ${totalToday} today.`
      })
    }

    // Get user phone if not provided
    const userData = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    const withdrawalPhone = phone || userData.phone

    // Initiate withdrawal (deduct from balance)
    const { transaction } = await walletService.initiateWithdrawal(user.userId, amount)

    try {
      // Call M-Pesa B2C API
      const reference = `SKYBET-WD-${transaction.id.slice(-8)}`
      const mpesaResponse = await initiateB2CWithdrawal(withdrawalPhone, amount, reference)

      // Update transaction with M-Pesa reference
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          reference: mpesaResponse.ConversationID || reference,
          description: `M-Pesa withdrawal - ${reference}`
        }
      })

      res.status(200).json({
        message: 'Withdrawal initiated successfully',
        data: {
          transactionId: transaction.id,
          amount,
          phone: withdrawalPhone,
          conversationID: mpesaResponse.ConversationID,
          originatorConversationID: mpesaResponse.OriginatorConversationID,
          processingTime: '24-48 hours'
        }
      })
    } catch (mpesaError) {
      console.error('M-Pesa B2C error:', mpesaError)
      
      // Refund the amount since M-Pesa failed
      await prisma.wallet.update({
        where: { userId: user.userId },
        data: {
          balance: { increment: amount }
        }
      })

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'failed',
          description: `Withdrawal failed: ${mpesaError.message}`
        }
      })

      res.status(500).json({
        error: 'Withdrawal processing failed',
        message: mpesaError.message,
        refunded: true
      })
    }
  } catch (error) {
    console.error('Withdrawal error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
