// pages/api/user/bets.js
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
    const { filter } = req.query
    const limit = parseInt(req.query.limit) || 50

    let whereClause = { userId: user.userId }

    // Apply filter
    if (filter === 'won') {
      whereClause.status = { in: ['won', 'cashed_out'] }
    } else if (filter === 'lost') {
      whereClause.status = 'lost'
    } else if (filter === 'pending') {
      whereClause.status = 'active'
    }

    const bets = await prisma.bet.findMany({
      where: whereClause,
      include: {
        game: {
          select: {
            crashMultiplier: true
          }
        }
      },
      orderBy: {
        placedAt: 'desc'
      },
      take: limit
    })

    res.status(200).json({
      data: bets
    })
  } catch (error) {
    console.error('Bets error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
