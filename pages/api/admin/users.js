// pages/api/admin/users.js
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

  // Check if user is admin (you might want to add an isAdmin field to User model)
  if (user.phone !== '254700000000') { // Simple admin check
    return res.status(403).json({ error: 'Admin access required' })
  }

  try {
    const { page = 1, limit = 50, search = '' } = req.query
    const skip = (page - 1) * limit

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        wallet: true,
        _count: {
          select: {
            bets: {
              where: { status: 'won' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip
    })

    const totalUsers = await prisma.user.count({
      where: whereClause
    })

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      status: u.status,
      kycVerified: u.kycVerified,
      balance: u.wallet?.balance || 0,
      totalBets: u._count?.bets || 0,
      dailyLimit: u.dailyLimit,
      createdAt: u.createdAt,
      lastActive: u.updatedAt
    }))

    res.status(200).json({
      data: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })
  } catch (error) {
    console.error('Admin users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
