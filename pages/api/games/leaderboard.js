// pages/api/games/leaderboard.js
import prisma from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { period } = req.query
    const limit = parseInt(req.query.limit) || 10

    let startDate = new Date()
    
    // Set date filter based on period
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'all-time') {
      startDate = new Date(0) // Beginning of time
    }

    // Get user stats for leaderboard
    const users = await prisma.user.findMany({
      where: {
        status: 'active'
      },
      include: {
        bets: {
          where: {
            placedAt: {
              gte: startDate
            }
          },
          select: {
            amount: true,
            profit: true,
            status: true
          }
        },
        _count: {
          select: {
            bets: {
              where: {
                placedAt: {
                  gte: startDate
                }
              }
            }
          }
        }
      },
      take: 100 // Get more users then filter
    })

    // Calculate stats for each user
    const leaderboard = users
      .map(user => {
        const bets = user.bets
        const totalBets = bets.length
        const wins = bets.filter(b => b.status === 'won' || b.status === 'cashed_out').length
        const profit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0)
        const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0

        return {
          userId: user.id,
          name: user.name,
          totalBets,
          wins,
          profit,
          winRate
        }
      })
      .filter(user => user.totalBets > 0 && user.profit > 0) // Only show profitable users with bets
      .sort((a, b) => b.profit - a.profit) // Sort by profit descending
      .slice(0, limit) // Take top N

    res.status(200).json({
      data: leaderboard
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
