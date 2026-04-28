// lib/middleware/responsibleGambling.js
import prisma from '../db';

export async function checkSelfExclusion(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // If user is excluded
  if (user.status === 'excluded') {
    // Check if exclusion has expired
    if (user.excludedUntil && new Date() > user.excludedUntil) {
      // Reactivate user
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'active',
          excludedUntil: null
        }
      });
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: user.excludedUntil 
        ? `Account is self-excluded until ${new Date(user.excludedUntil).toLocaleDateString()}`
        : 'Account is permanently self-excluded'
    };
  }

  return { allowed: true };
}

export async function checkDailyDepositLimit(userId, depositAmount) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // Get today's deposits
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDeposits = await prisma.transaction.aggregate({
    where: {
      userId,
      type: 'deposit',
      status: 'completed',
      createdAt: { gte: today }
    },
    _sum: {
      amount: true
    }
  });

  const totalToday = todayDeposits._sum.amount || 0;
  const remainingLimit = user.dailyLimit - totalToday;

  if (depositAmount > remainingLimit) {
    return {
      allowed: false,
      reason: `Daily deposit limit exceeded. You have KES ${remainingLimit.toFixed(0)} remaining today.`
    };
  }

  return { allowed: true, remainingLimit };
}

export async function checkLossLimit(userId, currentSessionLoss = 0, dailyLossLimit = null) {
  if (!dailyLossLimit) {
    return { allowed: true };
  }

  // Get today's losses
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayBets = await prisma.bet.findMany({
    where: {
      userId,
      placedAt: { gte: today },
      status: { in: ['lost', 'cashed_out'] }
    },
    include: {
      game: true
    }
  });

  const dailyLoss = todayBets.reduce((sum, bet) => {
    if (bet.status === 'lost') {
      return sum + bet.amount;
    }
    // For cashed out, profit could be negative if cashed out at less than bet
    const profit = bet.profit || 0;
    return sum + Math.min(0, profit);
  }, 0);

  const totalLoss = Math.abs(dailyLoss) + currentSessionLoss;

  if (totalLoss > dailyLossLimit) {
    return {
      allowed: false,
      reason: `Daily loss limit of KES ${dailyLossLimit} reached. Please take a break.`
    };
  }

  return { allowed: true, totalLoss, remaining: dailyLossLimit - totalLoss };
}
