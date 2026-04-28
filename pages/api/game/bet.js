// pages/api/game/bet.js - Place a bet
import { requireAuth } from '../../../lib/middleware/auth';
import gameEngine from '../../../lib/services/gameEngine';
import { checkSelfExclusion } from '../../../lib/middleware/responsibleGambling';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = requireAuth(req);

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Check self-exclusion
    const exclusionCheck = await checkSelfExclusion(user.userId);
    if (!exclusionCheck.allowed) {
      return res.status(403).json({
        error: 'Account restricted',
        message: exclusionCheck.reason
      });
    }

    const bet = await gameEngine.placeBet(user.userId, amount);

    res.status(200).json({
      message: 'Bet placed successfully',
      bet: {
        id: bet.id,
        amount: bet.amount,
        gameId: bet.gameId
      }
    });
  } catch (error) {
    console.error('Error placing bet:', error);
    const status = error.message.includes('Insufficient') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
}
