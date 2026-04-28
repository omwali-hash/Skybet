// src/components/game/LiveBetsTable.jsx
import React from 'react';

export default function LiveBetsTable({ activeTab }) {
  // Mock data for demonstration
  const liveBets = [
    { id: 1, user: 'John***', bet: 500, cashOut: null, status: 'active' },
    { id: 2, user: 'Mary***', bet: 200, cashOut: 2.35, status: 'cashed' },
    { id: 3, user: 'Peter***', bet: 1000, cashOut: null, status: 'active' },
  ];

  const withdrawals = [
    { id: 1, user: 'Alex***', amount: 5000, status: 'pending' },
  ];

  const topHolders = [
    { id: 1, user: 'BigWin***', balance: 150000, wins: 45 },
    { id: 2, user: 'Lucky***', balance: 120000, wins: 38 },
  ];

  const totalBets = liveBets.reduce((sum, bet) => sum + bet.bet, 0);
  totalBets;
  const totalWinnings = liveBets
    .filter(b => b.cashOut)
    .reduce((sum, bet) => sum + (bet.bet * bet.cashOut), 0);

  return (
    <div className="bg-gray-900">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-gray-800 text-xs">
        <div>
          <div className="text-gray-400">TOTAL BETS</div>
          <div className="font-bold text-white">{liveBets.length}</div>
        </div>
        <div>
          <div className="text-gray-400">TOTAL AMOUNT</div>
          <div className="font-bold text-white">KES {totalBets.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-400">TOTAL WINNINGS</div>
          <div className="font-bold text-green-500">KES {totalWinnings.toFixed(2)}</div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 border-b border-gray-700 text-xs font-bold text-gray-400">
        <div>USER</div>
        <div>BET KES</div>
        <div>CASH OUT KES</div>
      </div>

      {/* Table Content */}
      <div className="max-h-64 overflow-y-auto">
        {activeTab === 'live-bets' && (
          <div className="divide-y divide-gray-800">
            {liveBets.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No bets yet in this round
              </div>
            ) : (
              liveBets.map((bet) => (
                <div key={bet.id} className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
                  <div className="text-white font-medium">{bet.user}</div>
                  <div className="text-white">{bet.bet.toFixed(2)}</div>
                  <div className={bet.cashOut ? 'text-green-500' : 'text-gray-500'}>
                    {bet.cashOut ? `${(bet.bet * bet.cashOut).toFixed(2)}` : '-'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'live-withdrawals' && (
          <div className="divide-y divide-gray-800">
            {withdrawals.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No active withdrawals
              </div>
            ) : (
              withdrawals.map((item) => (
                <div key={item.id} className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
                  <div className="text-white font-medium">{item.user}</div>
                  <div className="text-white">KES {item.amount.toFixed(2)}</div>
                  <div className="text-yellow-500">{item.status}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'top-holders' && (
          <div className="divide-y divide-gray-800">
            {topHolders.map((holder) => (
              <div key={holder.id} className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
                <div className="text-white font-medium">{holder.user}</div>
                <div className="text-green-500">KES {holder.balance.toFixed(2)}</div>
                <div className="text-white">{holder.wins} wins</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
