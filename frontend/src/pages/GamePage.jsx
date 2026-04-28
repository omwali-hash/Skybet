// frontend/src/pages/GamePage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GamePage = () => {
  const navigate = useNavigate()
  const [multiplier, setMultiplier] = useState(1.0)
  const [gameActive, setGameActive] = useState(true)
  const [betAmount, setBetAmount] = useState('')
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!gameActive) return

    const interval = setInterval(() => {
      setMultiplier(prev => {
        const newMultiplier = prev + Math.random() * 0.15
        // Random crash between 1.5 and 50
        if (newMultiplier > Math.random() * 49 + 1.5) {
          setGameActive(false)
          return prev
        }
        return newMultiplier
      })
    }, 100)

    return () => clearInterval(interval)
  }, [gameActive])

  const handleBet = () => {
    if (betAmount) {
      setGameStarted(true)
      setGameActive(true)
      setMultiplier(1.0)
    }
  }

  const handleCashout = () => {
    setGameActive(false)
    // Handle cashout logic
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 left-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Game Area */}
        <div className="card bg-gray-800 text-white text-center py-16">
          <p className="text-gray-400 mb-4">Current Multiplier</p>
          {gameActive ? (
            <div className="multiplier-display">{multiplier.toFixed(2)}x</div>
          ) : (
            <div className="multiplier-display game-crashed">CRASHED!</div>
          )}
        </div>

        {/* Betting Area */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-6">Place Your Bet</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bet Amount (KES)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={gameStarted}
              min="10"
              max="50000"
              placeholder="Enter amount"
              className="input-field"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBet}
              disabled={gameStarted || !betAmount}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Bet
            </button>
            
            <button
              onClick={handleCashout}
              disabled={!gameStarted || !gameActive}
              className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cashout ({multiplier.toFixed(2)}x)
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="card mt-8 bg-blue-50">
          <h3 className="font-bold mb-2">How to Play</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Place your bet before the game starts</li>
            <li>• Watch the multiplier increase in real-time</li>
            <li>• Click "Cashout" before the crash to win your bet × multiplier</li>
            <li>• If you don't cashout before crash, you lose your bet</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GamePage
