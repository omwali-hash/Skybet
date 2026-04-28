// pages/api/user/stats.js
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
    // Get total bets
    const totalBets = await prisma.bet.count({
      where: { userId: user.userId }
    })

    // Get wins and losses
    const bets = await prisma.bet.findMany({
      where: { userId: user.userId },
      select: { status: true, profit: true }
    })

    const totalWins = bets.filter(b => b.status === 'won' || b.status === 'cashed_out').length
    const totalLosses = bets.filter(b => b.status === 'lost').length

    // Calculate total profit
    const profit = bets.reduce((sum, bet) => {
      if (bet.profit) {
        return sum + bet.profit
      }
      return sum
    }, 0)

    // Calculate win rate
    const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0

    res.status(200).json({
      data: {
        totalBets,
        totalWins,
        totalLosses,
        profit,
        winRate
      }
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
