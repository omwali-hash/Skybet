// pages/api/bonus/info.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    // Check if user already claimed today
    const todayClaim = await prisma.bonusClaim.findFirst({
      where: {
        userId: user.userId,
        claimedAt: {
          gte: today
        }
      }
    })

    const canClaim = !todayClaim

    // Calculate streak
    const allClaims = await prisma.bonusClaim.findMany({
      where: { userId: user.userId },
      orderBy: { claimedAt: 'desc' }
    })

    let streak = 0
    if (allClaims.length > 0) {
      // Check if claimed yesterday
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (allClaims[0].claimedAt >= yesterday) {
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
      }
    }

    // Calculate time until next claim
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const now = new Date()
    const diffMs = tomorrow - now
    const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60))
    const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    res.status(200).json({
      data: {
        canClaim,
        streak,
        hoursRemaining,
        minutesRemaining,
        lastClaim: todayClaim?.claimedAt || null
      }
    })
  } catch (error) {
    console.error('Bonus info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
