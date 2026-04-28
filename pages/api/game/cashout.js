// pages/api/game/cashout.js - Cash out a bet
import { requireAuth } from '../../../lib/middleware/auth';
import gameEngine from '../../../lib/services/gameEngine';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = requireAuth(req);

    const { betId } = req.body;

    if (!betId) {
      return res.status(400).json({ error: 'Bet ID is required' });
    }

    const result = await gameEngine.cashOut(betId);

    res.status(200).json({
      message: 'Cash out successful',
      winnings: parseFloat(result.winnings.toFixed(2)),
      profit: parseFloat(result.profit.toFixed(2)),
      multiplier: parseFloat(result.multiplier.toFixed(2))
    });
  } catch (error) {
    console.error('Error cashing out:', error);
    const status = error.message.includes('not') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
}
