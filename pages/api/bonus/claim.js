// pages/api/bonus/claim.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'
import walletService from '@/lib/services/wallet.service'

const BONUS_TIERS = [
  { minStreak: 0, bonus: 20 },
  { minStreak: 3, bonus: 50 },
  { minStreak: 7, bonus: 100 },
  { minStreak: 14, bonus: 200 },
  { minStreak: 21, bonus: 300 },
  { minStreak: 30, bonus: 500 }
]

function getBonusAmount(streak) {
  for (let i = BONUS_TIERS.length - 1; i >= 0; i--) {
    if (streak >= BONUS_TIERS[i].minStreak) {
      return BONUS_TIERS[i].bonus
    }
  }
  return BONUS_TIERS[0].bonus
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error } = authMiddleware(req)
  if (error) {
    return res.status(401).json({ error })
  }

  try {
    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already claimed today
    const existingClaim = await prisma.bonusClaim.findFirst({
      where: {
        userId: user.userId,
        claimedAt: {
          gte: today
        }
      }
    })

    if (existingClaim) {
      return res.status(400).json({
        error: 'Already claimed',
        message: 'You have already claimed your daily bonus today'
      })
    }

    // Calculate streak
    const allClaims = await prisma.bonusClaim.findMany({
      where: { userId: user.userId },
      orderBy: { claimedAt: 'desc' }
    })

    let streak = 1
    if (allClaims.length > 0) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (allClaims[0].claimedAt < yesterday) {
        // Streak reset
        streak = 1
      } else {
        // Count consecutive days
        streak = 1
        for (let i = 0; i < allClaims.length - 1; i++) {
          const current = new Date(allClaims[i].claimedAt)
          const next = new Date(allClaims[i + 1].claimedAt)
          const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            streak++
          } else {
            break
          }
        }
        streak++
      }
    }

    // Calculate bonus amount
    const bonusAmount = getBonusAmount(streak)

    // Credit wallet
    await walletService.creditWallet(
      user.userId,
      bonusAmount,
      `BONUS-${Date.now()}`,
      `Daily bonus - ${streak} day streak`
    )

    // Record bonus claim
    await prisma.bonusClaim.create({
      data: {
        userId: user.userId,
        amount: bonusAmount,
        streak
      }
    })

    res.status(200).json({
      message: 'Bonus claimed successfully',
      data: {
        amount: bonusAmount,
        streak
      }
    })
  } catch (error) {
    console.error('Claim bonus error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
