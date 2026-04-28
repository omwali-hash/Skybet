// pages/api/referral/list.js
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
    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.userId },
      include: {
        referred: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    const formattedReferrals = referrals.map(ref => ({
      id: ref.id,
      referredName: ref.referred?.name,
      referredPhone: ref.referred?.phone,
      bonusPaid: ref.bonusPaid,
      bonusAmount: ref.bonusAmount,
      completedAt: ref.completedAt,
      createdAt: ref.createdAt
    }))

    res.status(200).json({
      data: formattedReferrals
    })
  } catch (error) {
    console.error('Referral list error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
