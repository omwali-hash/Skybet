// pages/api/user/self-exclude.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error } = authMiddleware(req)
  if (error) {
    return res.status(401).json({ error })
  }

  try {
    const { duration } = req.body // '24h', '7d', '30d', 'permanent'

    if (!duration || !['24h', '7d', '30d', 'permanent'].includes(duration)) {
      return res.status(400).json({
        error: 'Invalid duration',
        message: 'Duration must be 24h, 7d, 30d, or permanent'
      })
    }

    // Calculate exclusion end date
    let excludedUntil = null
    if (duration !== 'permanent') {
      const now = new Date()
      if (duration === '24h') {
        now.setHours(now.getHours() + 24)
      } else if (duration === '7d') {
        now.setDate(now.getDate() + 7)
      } else if (duration === '30d') {
        now.setDate(now.getDate() + 30)
      }
      excludedUntil = now
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        status: 'excluded',
        excludedUntil,
        kycVerified: false // Force KYC re-verification after exclusion
      }
    })

    // Create exclusion record
    await prisma.transaction.create({
      data: {
        userId: user.userId,
        type: 'exclusion',
        amount: 0,
        status: 'completed',
        description: `Self-exclusion: ${duration}`,
        reference: `EXCL-${Date.now()}`
      }
    })

    res.status(200).json({
      message: 'Self-exclusion activated successfully',
      data: {
        duration,
        excludedUntil
      }
    })
  } catch (error) {
    console.error('Self-exclusion error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
