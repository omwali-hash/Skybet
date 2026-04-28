// pages/api/games/history.js
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
    const { limit = 50, offset = 0 } = req.query

    const games = await prisma.game.findMany({
      where: {
        status: 'crashed' // Only show completed games
      },
      select: {
        id: true,
        crashMultiplier: true,
        status: true,
        startedAt: true,
        endedAt: true,
        _count: {
          select: {
            bets: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    })

    res.status(200).json({
      data: games,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: games.length === parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Game history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
