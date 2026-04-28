// pages/api/game/history.js
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
    const limit = parseInt(req.query.limit) || 50

    const games = await prisma.game.findMany({
      where: {
        status: 'crashed'
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: limit
    })

    res.status(200).json({
      data: games
    })
  } catch (error) {
    console.error('Game history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
