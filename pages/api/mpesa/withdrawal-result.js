// pages/api/mpesa/withdrawal-result.js
import prisma from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { Result } = req.body

    if (!Result) {
      return res.status(400).json({ error: 'Invalid callback format' })
    }

    const {
      ResultCode,
      ResultDesc,
      OriginatorConversationID,
      ConversationID,
      TransactionReceipt,
      TransactionAmount,
      ResultParameters
    } = Result

    // Find the transaction by ConversationID or reference
    const transaction = await prisma.transaction.findFirst({
      where: {
        reference: ConversationID,
        type: 'withdrawal'
      }
    })

    if (!transaction) {
      console.error('Transaction not found for ConversationID:', ConversationID)
      return res.status(200).json({ ResultCode: 0 }) // Acknowledge anyway
    }

    if (ResultCode === 0) {
      // Successful withdrawal
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          reference: TransactionReceipt || ConversationID,
          description: `Withdrawal completed - ${ResultDesc}`
        }
      })

      console.log(`Withdrawal completed: ${transaction.id}, Receipt: ${TransactionReceipt}`)
    } else {
      // Failed withdrawal - refund the user
      await prisma.$transaction(async (tx) => {
        // Update transaction as failed
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'failed',
            description: `Withdrawal failed: ${ResultDesc}`
          }
        })

        // Refund the amount to wallet
        const refundAmount = Math.abs(transaction.amount)
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: {
            balance: { increment: refundAmount }
          }
        })

        // Create refund transaction
        await tx.transaction.create({
          data: {
            userId: transaction.userId,
            type: 'deposit',
            amount: refundAmount,
            status: 'completed',
            description: `Withdrawal refund - ${ResultDesc}`,
            reference: `REFUND-${transaction.id.slice(-8)}`
          }
        })
      })

      console.log(`Withdrawal failed and refunded: ${transaction.id}, Reason: ${ResultDesc}`)
    }

    // Acknowledge receipt
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (error) {
    console.error('Withdrawal callback error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
