// pages/api/auth/profile.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'

export default async function handler(req, res) {
  const { user, error } = authMiddleware(req)

  if (error) {
    return res.status(401).json({ error })
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({
      data: {
        id: dbUser.id,
        phone: dbUser.phone,
        name: dbUser.name,
        balance: dbUser.balance,
        role: dbUser.role
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}