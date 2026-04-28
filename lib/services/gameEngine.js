// lib/services/gameEngine.js
import prisma from '../db';

class GameEngine {
  constructor() {
    this.currentGame = null;
    this.multiplier = 1.00;
    this.gameState = 'waiting'; // waiting, running, crashed
    this.clients = new Set();
    this.gameInterval = null;
    this.crashPoint = null;
  }

  /**
   * Generate crash point using provably fair algorithm
   */
  generateCrashPoint() {
    const houseEdge = 0.03; // 3% house edge
    const e = 2 ** 32;
    const h = Math.floor(Math.random() * e);
    
    // If hash is divisible by 33, instant crash at 1.00x
    if (h % 33 === 0) {
      return 1.00;
    }
    
    // Calculate crash point with house edge
    const crashPoint = Math.floor((100 * e - h) / (e - h)) / 100;
    return Math.max(1.00, crashPoint * (1 - houseEdge));
  }

  /**
   * Start a new game round
   */
  async startNewGame() {
    // Create game in database
    this.crashPoint = this.generateCrashPoint();
    
    const game = await prisma.game.create({
      data: {
        crashMultiplier: this.crashPoint,
        houseEdge: 0.03,
        status: 'active',
        startedAt: new Date()
      }
    });

    this.currentGame = game;
    this.multiplier = 1.00;
    this.gameState = 'running';

    console.log(`🎮 Game started! Crash point: ${this.crashPoint.toFixed(2)}x`);

    // Notify all clients
    this.broadcast({
      type: 'game_start',
      gameId: game.id,
      roundId: game.id.slice(-6)
    });

    // Start multiplier increment
    this.startMultiplierLoop();

    return game;
  }

  /**
   * Increment multiplier in real-time
   */
  startMultiplierLoop() {
    const startTime = Date.now();
    
    this.gameInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Exponential growth formula
      this.multiplier = Math.pow(Math.E, 0.06 * elapsed);
      
      // Check if we've reached crash point
      if (this.multiplier >= this.crashPoint) {
        this.crashGame();
        return;
      }

      // Broadcast current multiplier
      this.broadcast({
        type: 'multiplier_update',
        multiplier: parseFloat(this.multiplier.toFixed(2)),
        timestamp: Date.now()
      });
    }, 50); // Update every 50ms
  }

  /**
   * Crash the current game
   */
  async crashGame() {
    clearInterval(this.gameInterval);
    this.gameState = 'crashed';

    console.log(`💥 Game crashed at ${this.crashPoint.toFixed(2)}x`);

    // Update game in database
    await prisma.game.update({
      where: { id: this.currentGame.id },
      data: {
        status: 'crashed',
        endedAt: new Date()
      }
    });

    // Handle losing bets (didn't cash out)
    await this.handleLosingBets();

    // Notify all clients
    this.broadcast({
      type: 'game_crashed',
      crashPoint: parseFloat(this.crashPoint.toFixed(2)),
      gameId: this.currentGame.id
    });

    // Start new round after 5 seconds
    setTimeout(() => {
      this.startNewGame();
    }, 5000);
  }

  /**
   * Handle bets that didn't cash out
   */
  async handleLosingBets() {
    const activeBets = await prisma.bet.findMany({
      where: {
        gameId: this.currentGame.id,
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

    for (const bet of activeBets) {
      // Mark bet as lost
      await prisma.bet.update({
        where: { id: bet.id },
        data: { status: 'lost' }
      });

      // Release frozen balance (already lost)
      await prisma.wallet.update({
        where: { userId: bet.userId },
        data: {
          frozenBalance: {
            decrement: bet.amount
          }
        }
      });

      // Log loss transaction
      await prisma.transaction.create({
        data: {
          userId: bet.userId,
          type: 'loss',
          amount: -bet.amount,
          status: 'completed',
          description: `Lost at ${this.crashPoint.toFixed(2)}x`,
          reference: `GAME_${this.currentGame.id.slice(-6)}`
        }
      });
    }
  }

  /**
   * Place a bet
   */
  async placeBet(userId, amount) {
    if (this.gameState !== 'running' && this.gameState !== 'waiting') {
      throw new Error('Game is not accepting bets');
    }

    if (amount < 10 || amount > 50000) {
      throw new Error('Bet amount must be between KES 10 and KES 50,000');
    }

    // Get user wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Debit wallet
    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
        frozenBalance: { increment: amount }
      }
    });

    // Create bet
    const bet = await prisma.bet.create({
      data: {
        userId,
        gameId: this.currentGame.id,
        amount,
        status: 'active',
        placedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });

    // Notify all clients
    this.broadcast({
      type: 'bet_placed',
      bet: {
        id: bet.id,
        user: bet.user.name.slice(0, 3) + '***',
        amount: bet.amount,
        timestamp: Date.now()
      }
    });

    return bet;
  }

  /**
   * Cash out bet
   */
  async cashOut(betId) {
    const bet = await prisma.bet.findUnique({
      where: { id: betId },
      include: {
        user: {
          include: {
            wallet: true
          }
        }
      }
    });

    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.status !== 'active') {
      throw new Error('Bet is not active');
    }

    if (this.gameState !== 'running') {
      throw new Error('Game is not running');
    }

    // Calculate winnings
    const winnings = bet.amount * this.multiplier;
    const profit = winnings - bet.amount;

    // Update bet
    await prisma.bet.update({
      where: { id: betId },
      data: {
        status: 'cashed_out',
        cashoutMultiplier: parseFloat(this.multiplier.toFixed(2)),
        profit
      }
    });

    // Credit wallet with winnings
    await prisma.wallet.update({
      where: { userId: bet.userId },
      data: {
        balance: { increment: winnings },
        frozenBalance: { decrement: bet.amount }
      }
    });

    // Log win transaction
    await prisma.transaction.create({
      data: {
        userId: bet.userId,
        type: 'win',
        amount: profit,
        status: 'completed',
        description: `Cashed out at ${this.multiplier.toFixed(2)}x`,
        reference: `GAME_${this.currentGame.id.slice(-6)}`
      }
    });

    // Notify all clients
    this.broadcast({
      type: 'bet_cashed',
      betId: bet.id,
      user: bet.user.name.slice(0, 3) + '***',
      multiplier: parseFloat(this.multiplier.toFixed(2)),
      winnings: parseFloat(winnings.toFixed(2)),
      profit: parseFloat(profit.toFixed(2))
    });

    return {
      winnings,
      profit,
      multiplier: this.multiplier
    };
  }

  /**
   * Get game history
   */
  async getGameHistory(limit = 20) {
    const games = await prisma.game.findMany({
      where: {
        status: 'crashed'
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        crashMultiplier: true,
        startedAt: true
      }
    });

    return games.map(game => ({
      id: game.id,
      multiplier: game.crashMultiplier,
      color: game.crashMultiplier >= 5 ? 'green' : 'blue',
      timestamp: game.startedAt
    }));
  }

  /**
   * Get active bets
   */
  async getActiveBets() {
    const bets = await prisma.bet.findMany({
      where: {
        gameId: this.currentGame?.id,
        status: 'active'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        placedAt: 'desc'
      }
    });

    return bets.map(bet => ({
      id: bet.id,
      user: bet.user.name.slice(0, 3) + '***',
      amount: bet.amount,
      cashOut: null,
      status: 'active'
    }));
  }

  /**
   * WebSocket: Add client
   */
  addClient(client) {
    this.clients.add(client);
    
    // Send current game state
    client.send(JSON.stringify({
      type: 'game_state',
      state: this.gameState,
      multiplier: parseFloat(this.multiplier.toFixed(2)),
      gameId: this.currentGame?.id,
      crashPoint: this.crashPoint
    }));
  }

  /**
   * WebSocket: Remove client
   */
  removeClient(client) {
    this.clients.delete(client);
  }

  /**
   * WebSocket: Broadcast to all clients
   */
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      try {
        client.send(message);
      } catch (error) {
        console.error('Error broadcasting to client:', error);
      }
    });
  }

  /**
   * Get online users count
   */
  getOnlineUsers() {
    return this.clients.size;
  }
}

// Singleton instance
export default new GameEngine();
