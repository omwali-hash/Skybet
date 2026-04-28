// pages/api/user/update-limit.js
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
    const { dailyLimit } = req.body

    if (!dailyLimit || typeof dailyLimit !== 'number') {
      return res.status(400).json({
        error: 'Invalid daily limit',
        message: 'Daily limit must be a number'
      })
    }

    if (dailyLimit < 1000) {
      return res.status(400).json({
        error: 'Limit too low',
        message: 'Daily limit must be at least KES 1,000'
      })
    }

    if (dailyLimit > 500000) {
      return res.status(400).json({
        error: 'Limit too high',
        message: 'Daily limit cannot exceed KES 500,000'
      })
    }

    // Update daily limit
    await prisma.user.update({
      where: { id: user.userId },
      data: { dailyLimit }
    })

    res.status(200).json({
      message: 'Daily limit updated successfully'
    })
  } catch (error) {
    console.error('Update limit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
