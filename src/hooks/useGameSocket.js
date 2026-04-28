// src/hooks/useGameSocket.js
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function useGameSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [history, setHistory] = useState([]);
  const [activeBets, setActiveBets] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [currentBetId, setCurrentBetId] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    socketRef.current = io({
      path: '/api/ws',
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Connected to game server');
      setConnected(true);
    });

    socket.on('message', (data) => {
      switch (data.type) {
        case 'game_state':
          setGameState(data.state);
          setMultiplier(data.multiplier);
          break;

        case 'game_start':
          setGameState('running');
          setMultiplier(1.00);
          break;

        case 'multiplier_update':
          setMultiplier(data.multiplier);
          break;

        case 'game_crashed':
          setGameState('crashed');
          setMultiplier(data.crashPoint);
          setCurrentBetId(null);
          break;

        case 'bet_placed':
          setActiveBets(prev => [...prev, data.bet]);
          break;

        case 'bet_cashed':
          setActiveBets(prev => prev.filter(b => b.id !== data.betId));
          break;

        default:
          break;
      }
    });

    socket.on('bet_success', (data) => {
      setCurrentBetId(data.betId);
      console.log('✅ Bet placed:', data.betId);
    });

    socket.on('bet_error', (data) => {
      console.error('❌ Bet error:', data.error);
      alert(data.error);
    });

    socket.on('cashout_success', (data) => {
      console.log('💰 Cash out successful!', data);
      alert(`Cash out! Won KES ${data.winnings.toFixed(2)} (Profit: KES ${data.profit.toFixed(2)})`);
      setCurrentBetId(null);
    });

    socket.on('cashout_error', (data) => {
      console.error('❌ Cash out error:', data.error);
      alert(data.error);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from game server');
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const placeBet = (userId, amount) => {
    if (socketRef.current) {
      socketRef.current.emit('place_bet', { userId, amount });
    }
  };

  const cashOut = (betId) => {
    if (socketRef.current) {
      socketRef.current.emit('cash_out', { betId });
    }
  };

  return {
    connected,
    gameState,
    multiplier,
    history,
    activeBets,
    onlineUsers,
    currentBetId,
    placeBet,
    cashOut
  };
}
