// src/components/layout/BottomNav.jsx
import React from 'react';

export default function BottomNav({ onWallet, onPlay, onDeposit, onWithdraw, onChat }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-2 py-2 z-50">
      <div className="flex justify-around items-center">
        {/* Wallet */}
        <button
          onClick={onWallet}
          className="flex flex-col items-center gap-1 px-3 py-2 text-gray-400 hover:text-white transition"
        >
          <span className="text-xl">💼</span>
          <span className="text-xs">WALLET</span>
        </button>

        {/* Play Game */}
        <button
          onClick={onPlay}
          className="flex flex-col items-center gap-1 px-3 py-2 text-gray-400 hover:text-white transition"
        >
          <span className="text-xl">▶️</span>
          <span className="text-xs">PLAY GAME</span>
        </button>

        {/* Deposit (Center - Highlighted) */}
        <button
          onClick={onDeposit}
          className="flex flex-col items-center gap-1 px-4 py-2 bg-red-600 rounded-lg -mt-4 shadow-lg hover:bg-red-700 transition"
        >
          <span className="text-2xl text-white">➕</span>
          <span className="text-xs text-white font-bold">DEPOSIT</span>
        </button>

        {/* Withdrawals */}
        <button
          onClick={onWithdraw}
          className="flex flex-col items-center gap-1 px-3 py-2 text-gray-400 hover:text-white transition"
        >
          <span className="text-xl">🔄</span>
          <span className="text-xs">WITHDRAW</span>
        </button>

        {/* Chat/Rain */}
        <button
          onClick={onChat}
          className="flex flex-col items-center gap-1 px-3 py-2 text-gray-400 hover:text-white transition"
        >
          <span className="text-xl">💬</span>
          <span className="text-xs">CHAT</span>
        </button>
      </div>
    </nav>
  );
}
