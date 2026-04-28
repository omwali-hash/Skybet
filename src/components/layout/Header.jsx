// src/components/layout/Header.jsx
import React from 'react';
import ThemeToggle from '../common/ThemeToggle';
import Notifications from '../common/Notifications';

export default function Header({ balance = 0, onDeposit, onMenu }) {
  return (
    <header className="bg-red-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white text-lg">✈️</span>
        </div>
        <span className="font-bold text-white text-lg">SkyBet</span>
      </div>

      {/* Balance, Notifications & Deposit */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Notifications />
        <div className="text-right">
          <div className="text-xs text-red-200">Balance</div>
          <div className="font-bold text-white">KES {balance.toFixed(2)}</div>
        </div>
        <button
          onClick={onDeposit}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold text-sm transition"
        >
          DEPOSIT
        </button>
      </div>

      {/* Menu Icon */}
      <button onClick={onMenu} className="text-white text-2xl">
        ☰
      </button>
    </header>
  );
}
