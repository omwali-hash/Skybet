// pages/api/user/update-pin.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'
import bcrypt from 'bcrypt'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error } = authMiddleware(req)
  if (error) {
    return res.status(401).json({ error })
  }

  try {
    const { currentPin, newPin } = req.body

    if (!currentPin || !newPin) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Current PIN and new PIN are required'
      })
    }

    if (newPin.length < 4 || newPin.length > 8) {
      return res.status(400).json({
        error: 'Invalid PIN length',
        message: 'PIN must be between 4 and 8 digits'
      })
    }

    // Get user with current PIN
    const userData = await prisma.user.findUnique({
      where: { id: user.userId }
    })

    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current PIN
    const isValidPin = await bcrypt.compare(currentPin, userData.pinHash)
    if (!isValidPin) {
      return res.status(401).json({
        error: 'Invalid current PIN',
        message: 'Current PIN is incorrect'
      })
    }

    // Hash new PIN
    const newPinHash = await bcrypt.hash(newPin, 10)

    // Update PIN
    await prisma.user.update({
      where: { id: user.userId },
      data: { pinHash: newPinHash }
    })

    res.status(200).json({
      message: 'PIN updated successfully'
    })
  } catch (error) {
    console.error('Update PIN error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
