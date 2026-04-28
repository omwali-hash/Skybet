// backend/src/services/wallet.service.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class WalletService {
  /**
   * Get user wallet
   */
  async getWallet(userId) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return wallet;
  }

  /**
   * Credit wallet
   */
  async creditWallet(userId, amount, transactionRef, description) {
    const wallet = await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    // Log transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'deposit',
        amount,
        status: 'completed',
        reference: transactionRef,
        description
      }
    });

    return wallet;
  }

  /**
   * Debit wallet for bet
   */
  async debitForBet(userId, amount) {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const updated = await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount
        },
        frozenBalance: {
          increment: amount
        }
      }
    });

    return updated;
  }

  /**
   * Release frozen balance (when bet loses)
   */
  async releaseFrozenBalance(userId, amount) {
    return prisma.wallet.update({
      where: { userId },
      data: {
        frozenBalance: {
          decrement: amount
        }
      }
    });
  }

  /**
   * Complete bet win
   */
  async completeBetWin(userId, betAmount, winnings) {
    const wallet = await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: winnings
        },
        frozenBalance: {
          decrement: betAmount
        }
      }
    });

    // Log transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'win',
        amount: winnings - betAmount,
        status: 'completed',
        description: `Crash game win - ${((winnings / betAmount) * 100).toFixed(0)}% profit`
      }
    });

    return wallet;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId, limit = 50, skip = 0) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip
    });

    return transactions;
  }

  /**
   * Initiate withdrawal
   */
  async initiateWithdrawal(userId, amount) {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Deduct amount
    const updated = await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    // Create withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        description: 'M-Pesa withdrawal pending'
      }
    });

    return {
      wallet: updated,
      transaction
    };
  }

  /**
   * Complete withdrawal
   */
  async completeWithdrawal(transactionId, mpesaRef) {
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'completed',
        reference: mpesaRef
      }
    });

    return transaction;
  }

  /**
   * Check daily deposit limit
   */
  async checkDailyLimit(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Get today's deposits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDeposits = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'deposit',
        createdAt: {
          gte: today
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalToday = todayDeposits._sum.amount || 0;
    const remainingLimit = user.dailyLimit - totalToday;

    return {
      limit: user.dailyLimit,
      usedToday: totalToday,
      remaining: remainingLimit
    };
  }
}

module.exports = new WalletService();
