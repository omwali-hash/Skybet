// pages/api/game/current.js - Get current game state
import gameEngine from '../../../lib/services/gameEngine';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const history = await gameEngine.getGameHistory(10);
    const activeBets = await gameEngine.getActiveBets();
    const onlineUsers = gameEngine.getOnlineUsers();

    res.status(200).json({
      gameState: gameEngine.gameState,
      multiplier: parseFloat(gameEngine.multiplier.toFixed(2)),
      currentGame: gameEngine.currentGame,
      history,
      activeBets,
      onlineUsers,
      playingUsers: activeBets.length
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
}
