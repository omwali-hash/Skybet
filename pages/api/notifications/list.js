// pages/api/notifications/list.js
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
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    // Get notifications (in production, this would be from a notifications table)
    // For now, we'll simulate with transaction-based notifications
    const notifications = await prisma.transaction.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Convert transactions to notification format
    const formattedNotifications = notifications.map(tx => {
      let type = 'info'
      let title = ''
      let message = tx.description || 'Transaction'
      
      if (tx.type === 'deposit') {
        type = 'success'
        title = 'Deposit Successful'
        message = `KES ${tx.amount} has been added to your account`
      } else if (tx.type === 'withdrawal') {
        if (tx.status === 'completed') {
          type = 'success'
          title = 'Withdrawal Successful'
          message = `KES ${Math.abs(tx.amount)} has been sent to your M-Pesa`
        } else if (tx.status === 'pending') {
          type = 'info'
          title = 'Withdrawal Processing'
          message = `Your withdrawal of KES ${Math.abs(tx.amount)} is being processed`
        } else if (tx.status === 'failed') {
          type = 'error'
          title = 'Withdrawal Failed'
          message = `Your withdrawal of KES ${Math.abs(tx.amount)} could not be processed`
        }
      } else if (tx.type === 'win') {
        type = 'success'
        title = 'Game Won!'
        message = `You won KES ${tx.amount}!`
      } else if (tx.type === 'bonus') {
        type = 'success'
        title = 'Bonus Received'
        message = `You received KES ${tx.amount} bonus`
      }

      return {
        id: tx.id,
        type,
        title,
        message,
        read: false, // In production, track read status
        createdAt: tx.createdAt
      }
    })

    res.status(200).json({
      data: formattedNotifications
    })
  } catch (error) {
    console.error('Notifications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
