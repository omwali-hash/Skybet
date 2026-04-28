// src/components/game/BetPanel.jsx
import React, { useState } from 'react';

export default function BetPanel({ 
  panelNumber = 1, 
  initialStake = 20, 
  autoCashOut = 1.20,
  gameState,
  onBet,
  onCashOut 
}) {
  const [stake, setStake] = useState(initialStake);
  const [autoCashOutEnabled, setAutoCashOutEnabled] = useState(false);
  const [autoCashOutValue, setAutoCashOutValue] = useState(autoCashOut);

  const quickStakes = [50, 100, 200, 500];

  const decreaseStake = () => setStake(prev => Math.max(10, prev - 10));
  const increaseStake = () => setStake(prev => prev + 10);

  const handleQuickStake = (amount) => setStake(amount);

  const isWaiting = gameState === 'waiting';
  const isRunning = gameState === 'running';

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      {/* Stake Input Row */}
      <div className="flex gap-2">
        {/* Stake Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={decreaseStake}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold text-xl"
            >
              −
            </button>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              className="flex-1 h-10 bg-gray-900 text-white text-center font-bold rounded border border-gray-600"
              min="10"
            />
            <button
              onClick={increaseStake}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold text-xl"
            >
              +
            </button>
          </div>

          {/* Quick Select Chips */}
          <div className="flex gap-2">
            {quickStakes.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickStake(amount)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-bold transition"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Bet Button */}
        <button
          onClick={() => isWaiting ? onBet(stake) : onCashOut()}
          disabled={gameState === 'crashed'}
          className={`w-32 font-bold text-white rounded transition ${
            isWaiting
              ? 'bg-green-600 hover:bg-green-700'
              : isRunning
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <div className="text-sm">
            {isWaiting ? 'BET' : isRunning ? 'CASH OUT' : 'WAITING'}
          </div>
          <div className="text-xs mt-1">
            {isWaiting && `KSH ${stake.toFixed(2)}`}
            {isRunning && `@ ${stake * 2} KSH`}
          </div>
        </button>
      </div>

      {/* Auto Cash Out */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">AUTO CASH OUT</span>
          <button
            onClick={() => setAutoCashOutEnabled(!autoCashOutEnabled)}
            className={`w-10 h-5 rounded-full transition ${
              autoCashOutEnabled ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition transform ${
                autoCashOutEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            ></div>
          </button>
        </div>

        {autoCashOutEnabled && (
          <input
            type="number"
            value={autoCashOutValue}
            onChange={(e) => setAutoCashOutValue(Number(e.target.value))}
            className="w-20 h-8 bg-gray-900 text-white text-center text-sm rounded border border-gray-600"
            step="0.10"
            min="1.10"
          />
        )}
      </div>
    </div>
  );
}
