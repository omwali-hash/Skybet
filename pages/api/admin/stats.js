// pages/api/admin/stats.js
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

  // Check if user is admin
  if (user.phone !== '254700000000') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get user stats
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { status: 'active' }
    })

    // Get total bets
    const totalBets = await prisma.bet.count()

    // Get this month's stats
    const monthlyBets = await prisma.bet.count({
      where: {
        placedAt: {
          gte: thisMonth
        }
      }
    })

    // Get total deposits
    const totalDeposits = await prisma.transaction.aggregate({
      where: {
        type: 'deposit',
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    })

    // Get this month's deposits
    const monthlyDeposits = await prisma.transaction.aggregate({
      where: {
        type: 'deposit',
        status: 'completed',
        createdAt: {
          gte: thisMonth
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get total withdrawals
    const totalWithdrawals = await prisma.transaction.aggregate({
      where: {
        type: 'withdrawal',
        status: 'completed'
      },
      _sum: {
        amount: true
      }
    })

    // Get this month's withdrawals
    const monthlyWithdrawals = await prisma.transaction.aggregate({
      where: {
        type: 'withdrawal',
        status: 'completed',
        createdAt: {
          gte: thisMonth
        }
      },
      _sum: {
        amount: true
      }
    })

    // Calculate house edge
    const totalBetAmount = await prisma.bet.aggregate({
      where: {
        status: { in: ['lost', 'cashed_out'] }
      },
      _sum: {
        amount: true
      }
    })

    const totalWinAmount = await prisma.bet.aggregate({
      where: {
        status: 'cashed_out'
      },
      _sum: {
        profit: true
      }
    })

    const houseEdge = totalBetAmount._sum.amount > 0 
      ? ((totalBetAmount._sum.amount + (totalWinAmount._sum.profit || 0)) - (totalWinAmount._sum.profit || 0)) / totalBetAmount._sum.amount * 100
      : 0

    const stats = {
      totalUsers,
      activeUsers,
      totalBets,
      monthlyBets,
      totalDeposits: totalDeposits._sum.amount || 0,
      monthlyDeposits: monthlyDeposits._sum.amount || 0,
      totalWithdrawals: Math.abs(totalWithdrawals._sum.amount || 0),
      monthlyWithdrawals: Math.abs(monthlyWithdrawals._sum.amount || 0),
      houseEdge: houseEdge.toFixed(2),
      totalBetAmount: totalBetAmount._sum.amount || 0,
      totalWinAmount: totalWinAmount._sum.profit || 0,
      netRevenue: (totalDeposits._sum.amount || 0) - Math.abs(totalWithdrawals._sum.amount || 0)
    }

    res.status(200).json({
      data: stats
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
