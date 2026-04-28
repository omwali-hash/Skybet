// pages/api/referral/claim.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'
import walletService from '@/lib/services/wallet.service'

const REFERRAL_BONUS = 100
const MIN_DEPOSIT_FOR_BONUS = 100

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error } = authMiddleware(req)
  if (error) {
    return res.status(401).json({ error })
  }

  try {
    // Check if user was referred
    const referral = await prisma.referral.findFirst({
      where: {
        referredId: user.userId,
        bonusPaid: false
      },
      include: {
        referrer: true
      }
    })

    if (!referral) {
      return res.status(400).json({
        error: 'No pending referral',
        message: 'You do not have a pending referral bonus'
      })
    }

    // Check if user has made the minimum deposit
    const deposits = await prisma.transaction.findMany({
      where: {
        userId: user.userId,
        type: 'deposit',
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    })

    const totalDeposited = deposits._sum.amount || 0

    if (totalDeposited < MIN_DEPOSIT_FOR_BONUS) {
      return res.status(400).json({
        error: 'Deposit requirement not met',
        message: `You need to deposit at least KES ${MIN_DEPOSIT_FOR_BONUS} to claim your referral bonus`
      })
    }

    // Credit referrer's wallet
    await walletService.creditWallet(
      referral.referrerId,
      REFERRAL_BONUS,
      `REF-${referral.id.slice(-8)}`,
      `Referral bonus from ${user.name}`
    )

    // Update referral record
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        bonusPaid: true,
        bonusAmount: REFERRAL_BONUS,
        completedAt: new Date()
      }
    })

    res.status(200).json({
      message: 'Referral bonus claimed successfully',
      data: {
        bonusAmount: REFERRAL_BONUS
      }
    })
  } catch (error) {
    console.error('Claim referral error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
