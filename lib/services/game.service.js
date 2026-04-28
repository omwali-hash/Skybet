// lib/services/game.service.js
import prisma from '../db';

class GameService {
  /**
   * Generate random crash multiplier
   * Using normal distribution weighted towards lower multipliers
   */
  generateCrashMultiplier() {
    const minCrash = parseFloat(process.env.MIN_CRASH_MULTIPLIER) || 1.05;
    const maxCrash = parseFloat(process.env.MAX_MULTIPLIER) || 1000;
    
    // Use exponential distribution for more realistic crash patterns
    const random = Math.random();
    const exponent = -Math.log(random) / 2; // Lambda = 2 for reasonable crashes
    const crash = minCrash * Math.exp(exponent);
    
    return Math.min(crash, maxCrash);
  }

  /**
   * Create a new game
   */
  async createGame() {
    const crashMultiplier = this.generateCrashMultiplier();
    
    const game = await prisma.game.create({
      data: {
        crashMultiplier: parseFloat(crashMultiplier.toFixed(2)),
        houseEdge: parseFloat(process.env.HOUSE_EDGE) || 0.03,
        status: 'active'
      }
    });

    return game;
  }

  /**
   * Get current or latest game
   */
  async getCurrentGame() {
    const game = await prisma.game.findFirst({
      where: {
        status: { in: ['pending', 'active'] }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return game;
  }

  /**
   * Crash current game
   */
  async crashGame(gameId) {
    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'crashed',
        endedAt: new Date()
      }
    });

    // Get all active bets for this game
    const activeBets = await prisma.bet.findMany({
      where: {
        gameId,
        status: 'active'
      },
      include: {
        user: {
          include: {
            wallet: true
          }
        }
      }
    });

    // Mark losing bets
    const losingBets = activeBets.filter(bet => !bet.cashoutMultiplier);
    
    for (const bet of losingBets) {
      await prisma.bet.update({
        where: { id: bet.id },
        data: { status: 'lost' }
      });

      // Log loss transaction
      await prisma.transaction.create({
        data: {
          userId: bet.userId,
          type: 'loss',
          amount: -bet.amount,
          status: 'completed',
          description: `Crash game lost - Game crashed at ${game.crashMultiplier}x`
        }
      });
    }

    return game;
  }

  /**
   * Get game statistics
   */
  async getGameStats(userId) {
    const stats = await prisma.bet.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
      _sum: {
        amount: true,
        profit: true
      }
    });

    return stats;
  }

  /**
   * Get user's win rate
   */
  async calculateWinRate(userId) {
    const totalBets = await prisma.bet.count({
      where: { userId }
    });

    const winningBets = await prisma.bet.count({
      where: {
        userId,
        status: { in: ['won', 'cashed_out'] }
      }
    });

    if (totalBets === 0) return 0;
    return ((winningBets / totalBets) * 100).toFixed(2);
  }
}

export default new GameService();
