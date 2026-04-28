// pages/index.js - Main Aviator Game Page (Landing Page)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import GameCanvas from '../src/components/game/GameCanvas';
import MultiplierHistory from '../src/components/game/MultiplierHistory';
import BetPanel from '../src/components/game/BetPanel';
import LiveBetsTable from '../src/components/game/LiveBetsTable';
import Leaderboard from '../src/components/game/Leaderboard';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

export default function HomePage() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const [gameState, setGameState] = useState('waiting'); // waiting, running, crashed
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [history, setHistory] = useState([
    { id: 1, multiplier: 6.43, color: 'green' },
    { id: 2, multiplier: 2.35, color: 'blue' },
    { id: 3, multiplier: 2.72, color: 'blue' },
    { id: 4, multiplier: 2.88, color: 'blue' },
    { id: 5, multiplier: 3.55, color: 'blue' },
    { id: 6, multiplier: 11.05, color: 'green' },
    { id: 7, multiplier: 4.69, color: 'blue' },
    { id: 8, multiplier: 1.88, color: 'green' },
    { id: 9, multiplier: 2.70, color: 'blue' },
    { id: 10, multiplier: 3.08, color: 'blue' },
  ]);
  const [onlineUsers, setOnlineUsers] = useState(222);
  const [playingUsers, setPlayingUsers] = useState(100);
  const [activeTab, setActiveTab] = useState('live-bets'); // live-bets, live-withdrawals, top-holders

  // Simulate game loop
  useEffect(() => {
    if (gameState === 'running') {
      const interval = setInterval(() => {
        setCurrentMultiplier(prev => {
          const newMult = prev + 0.01 * Math.random() * prev;
          if (newMult >= 4.33) { // Simulated crash point
            setGameState('crashed');
            return newMult;
          }
          return newMult;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  const startGame = () => {
    setGameState('running');
    setCurrentMultiplier(1.00);
  };

  const resetGame = () => {
    setGameState('waiting');
    setCurrentMultiplier(1.00);
    // Add to history
    setHistory(prev => [
      { id: Date.now(), multiplier: 4.33, color: 'blue' },
      ...prev.slice(0, 9)
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header 
        balance={user?.balance || 0} 
        onDeposit={() => router.push('/deposit')}
        onMenu={() => router.push('/dashboard')}
      />

      {/* Multiplier History */}
      <MultiplierHistory history={history} />

      {/* Main Game Canvas */}
      <GameCanvas 
        multiplier={currentMultiplier}
        gameState={gameState}
        roundId="#303081"
      />

      {/* Tab Selector */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-semibold ${
            activeTab === 'stake' 
              ? 'bg-red-900 text-white' 
              : 'bg-red-600 text-white'
          }`}
          onClick={() => setActiveTab('stake')}
        >
          STAKE SELECTOR
        </button>
        <button
          className={`flex-1 py-3 text-sm font-semibold ${
            activeTab === 'ai' 
              ? 'bg-red-900 text-white' 
              : 'bg-red-600 text-white'
          }`}
          onClick={() => setActiveTab('ai')}
        >
          AI
        </button>
      </div>

      {/* Bet Panels */}
      <div className="px-4 py-4 space-y-3">
        <BetPanel 
          panelNumber={1}
          initialStake={20}
          autoCashOut={1.20}
          gameState={gameState}
          onBet={(amount) => console.log('Bet placed:', amount)}
          onCashOut={() => console.log('Cash out')}
        />
        <BetPanel 
          panelNumber={2}
          initialStake={20}
          autoCashOut={1.20}
          gameState={gameState}
          onBet={(amount) => console.log('Bet placed:', amount)}
          onCashOut={() => console.log('Cash out')}
        />
      </div>

      {/* Live Data Tabs */}
      <div className="border-t border-gray-700">
        <div className="flex border-b border-gray-700 bg-red-700">
          <button
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'live-bets' ? 'bg-red-900' : ''
            }`}
            onClick={() => setActiveTab('live-bets')}
          >
            <span>📋</span> LIVE BETS
          </button>
          <button
            className={`flex-1 py-3 text-xs font-semibold ${
              activeTab === 'live-withdrawals' ? 'bg-red-900' : ''
            }`}
            onClick={() => setActiveTab('live-withdrawals')}
          >
            LIVE WITHDRAWALS
          </button>
          <button
            className={`flex-1 py-3 text-xs font-semibold ${
              activeTab === 'top-holders' ? 'bg-red-900' : ''
            }`}
            onClick={() => setActiveTab('top-holders')}
          >
            TOP HOLDERS
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-red-800 text-xs">
          <span>ONLINE USERS: {onlineUsers}</span>
          <div className="w-px h-4 bg-gray-600"></div>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            PLAYING: {playingUsers}
          </span>
        </div>

        {/* Live Bets Table */}
        {activeTab === 'top-holders' ? (
          <div className="p-4">
            <Leaderboard />
          </div>
        ) : (
          <LiveBetsTable activeTab={activeTab} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        onWallet={() => router.push('/wallet')}
        onPlay={() => router.push('/')}
        onDeposit={() => router.push('/deposit')}
        onWithdraw={() => router.push('/withdraw')}
        onChat={() => router.push('/chat')}
      />

      {/* Demo Controls (for testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 right-4 flex gap-2 z-50">
          {gameState === 'waiting' && (
            <button 
              onClick={startGame}
              className="bg-green-600 px-4 py-2 rounded text-sm font-bold"
            >
              Start Game
            </button>
          )}
          {gameState === 'crashed' && (
            <button 
              onClick={resetGame}
              className="bg-blue-600 px-4 py-2 rounded text-sm font-bold"
            >
              New Round
            </button>
          )}
        </div>
      )}
    </div>
  );
}
