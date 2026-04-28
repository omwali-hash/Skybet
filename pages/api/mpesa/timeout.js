// pages/api/mpesa/timeout.js
import prisma from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { Result } = req.body

    // Log timeout for monitoring
    console.log('M-Pesa timeout callback received:', JSON.stringify(req.body, null, 2))

    if (Result && Result.OriginatorConversationID) {
      // Find transaction and mark as failed
      const transaction = await prisma.transaction.findFirst({
        where: {
          reference: Result.OriginatorConversationID,
          type: 'withdrawal',
          status: 'pending'
        }
      })

      if (transaction) {
        // Refund the amount
        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'failed',
              description: 'Withdrawal timed out'
            }
          })

          const refundAmount = Math.abs(transaction.amount)
          await tx.wallet.update({
            where: { userId: transaction.userId },
            data: {
              balance: { increment: refundAmount }
            }
          })

          await tx.transaction.create({
            data: {
              userId: transaction.userId,
              type: 'deposit',
              amount: refundAmount,
              status: 'completed',
              description: 'Withdrawal timeout refund',
              reference: `REFUND-${transaction.id.slice(-8)}`
            }
          })
        })

        console.log(`Withdrawal timeout refunded: ${transaction.id}`)
      }
    }

    // Acknowledge receipt
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (error) {
    console.error('Timeout callback error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
