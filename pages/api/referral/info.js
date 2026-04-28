// pages/api/referral/info.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'
import { randomBytes } from 'crypto'

function generateReferralCode() {
  return randomBytes(4).toString('hex').toUpperCase()
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error } = authMiddleware(req)
  if (error) {
    return res.status(401).json({ error })
  }

  try {
    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        referralsAsReferrer: {
          include: {
            referred: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Generate referral code if user doesn't have one
    let referralCode = userData.referralCode
    if (!referralCode) {
      referralCode = generateReferralCode()
      
      // Ensure uniqueness
      let isUnique = false
      while (!isUnique) {
        const existing = await prisma.user.findUnique({
          where: { referralCode }
        })
        if (!existing) {
          isUnique = true
        } else {
          referralCode = generateReferralCode()
        }
      }

      await prisma.user.update({
        where: { id: user.userId },
        data: { referralCode }
      })
    }

    // Calculate stats
    const totalReferrals = userData.referralsAsReferrer.length
    const completedReferrals = userData.referralsAsReferrer.filter(r => r.bonusPaid).length
    const totalEarned = userData.referralsAsReferrer
      .filter(r => r.bonusPaid)
      .reduce((sum, r) => sum + r.bonusAmount, 0)

    res.status(200).json({
      data: {
        referralCode,
        totalReferrals,
        completedReferrals,
        totalEarned
      }
    })
  } catch (error) {
    console.error('Referral info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
