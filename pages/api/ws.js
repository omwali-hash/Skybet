// pages/api/ws.js - WebSocket endpoint
import { Server } from 'socket.io';
import gameEngine from '../../lib/services/gameEngine';

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('🔌 Initializing WebSocket server...');

    io = new Server(res.socket.server, {
      path: '/api/ws',
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // Add to game engine
      gameEngine.addClient({
        send: (data) => socket.emit('message', JSON.parse(data))
      });

      // Handle bet placement
      socket.on('place_bet', async (data) => {
        try {
          const { userId, amount } = data;
          const bet = await gameEngine.placeBet(userId, amount);
          socket.emit('bet_success', { betId: bet.id, amount });
        } catch (error) {
          socket.emit('bet_error', { error: error.message });
        }
      });

      // Handle cash out
      socket.on('cash_out', async (data) => {
        try {
          const { betId } = data;
          const result = await gameEngine.cashOut(betId);
          socket.emit('cashout_success', result);
        } catch (error) {
          socket.emit('cashout_error', { error: error.message });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
        gameEngine.removeClient({
          send: () => {}
        });
      });
    });

    // Start the first game
    setTimeout(() => {
      gameEngine.startNewGame();
    }, 2000);
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false
  }
};
