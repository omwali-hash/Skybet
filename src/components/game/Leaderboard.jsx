// src/components/game/Leaderboard.jsx
import React, { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('daily'); // daily, weekly, all-time
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const fetchLeaderboard = async (period) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/games/leaderboard?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-red-700 px-4 py-3">
        <h3 className="font-bold text-white">🏆 Leaderboard</h3>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-700">
        {['daily', 'weekly', 'all-time'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold transition ${
              activeTab === tab
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-gray-400">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No data yet</div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <div
                key={player.userId}
                className="flex items-center justify-between p-2 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${getRankColor(index + 1)}`}>
                    {getRankIcon(index + 1)}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">
                      {player.name?.substring(0, 10) || 'Anonymous'}***
                    </p>
                    <p className="text-xs text-gray-400">
                      {player.totalBets} bets
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">
                    +KES {player.profit.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {player.winRate.toFixed(0)}% win
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
