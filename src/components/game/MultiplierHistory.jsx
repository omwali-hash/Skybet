// src/components/game/MultiplierHistory.jsx
import React from 'react';

export default function MultiplierHistory({ history = [] }) {
  return (
    <div className="bg-gray-800 px-4 py-2 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {history.map((item) => (
          <span
            key={item.id}
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              item.multiplier >= 5
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {item.multiplier.toFixed(2)}x
          </span>
        ))}
        <span className="px-3 py-1 text-gray-500">...</span>
      </div>
    </div>
  );
}
