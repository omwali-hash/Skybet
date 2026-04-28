// pages/game.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import io from 'socket.io-client'

export default function GamePage() {
  const { token, user } = useSelector(state => state.auth)
  const { balance } = useSelector(state => state.wallet)
  const router = useRouter()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState({
    status: 'waiting',
    multiplier: 1.00,
    crashPoint: null
  })
  const [betAmount, setBetAmount] = useState('')
  const [autoCashout, setAutoCashout] = useState('')
  const [currentBet, setCurrentBet] = useState(null)
  const [gameHistory, setGameHistory] = useState([])

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL)
    setSocket(newSocket)

    newSocket.on('game-update', (data) => {
      setGameState(data)
    })

    newSocket.on('game-history', (history) => {
      setGameHistory(history)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [token, router])

  const placeBet = () => {
    if (!betAmount || !socket) return

    socket.emit('place-bet', {
      amount: parseFloat(betAmount),
      autoCashout: autoCashout ? parseFloat(autoCashout) : null
    })

    setCurrentBet({
      amount: parseFloat(betAmount),
      multiplier: 1.00,
      status: 'active'
    })
  }

  const cashout = () => {
    if (!socket || !currentBet) return

    socket.emit('cashout')
  }

  const getMultiplierColor = (multiplier) => {
    if (multiplier < 2) return 'text-green-600'
    if (multiplier < 5) return 'text-yellow-600'
    if (multiplier < 10) return 'text-orange-600'
    return 'text-red-600'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
              ← Back to Dashboard
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-400">Balance</p>
              <p className="text-lg font-semibold text-green-400">KSh {balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">Aviator</h1>
                <div className={`text-6xl font-bold ${getMultiplierColor(gameState.multiplier)}`}>
                  {gameState.multiplier.toFixed(2)}x
                </div>
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    gameState.status === 'running' ? 'bg-green-600' :
                    gameState.status === 'crashed' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {gameState.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Betting Controls */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bet Amount (KSh)
                    </label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="10"
                      min="10"
                      max={balance}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={gameState.status === 'running'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Auto Cashout (optional)
                    </label>
                    <input
                      type="number"
                      value={autoCashout}
                      onChange={(e) => setAutoCashout(e.target.value)}
                      placeholder="2.00"
                      min="1.01"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={gameState.status === 'running'}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={placeBet}
                    disabled={!betAmount || gameState.status === 'running' || parseFloat(betAmount) > balance}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Bet
                  </button>
                  {currentBet && gameState.status === 'running' && (
                    <button
                      onClick={cashout}
                      className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700"
                    >
                      Cash Out ({(currentBet.amount * gameState.multiplier).toFixed(2)} KSh)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game History */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Games</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gameHistory.slice(0, 10).map((game, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-sm">Game #{game.id}</span>
                    <span className={`text-sm font-semibold ${getMultiplierColor(game.crashPoint)}`}>
                      {game.crashPoint?.toFixed(2)}x
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Bet */}
            {currentBet && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Current Bet</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>KSh {currentBet.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className={getMultiplierColor(gameState.multiplier)}>
                      {gameState.multiplier.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Potential Win:</span>
                    <span className="text-green-400">
                      KSh {(currentBet.amount * gameState.multiplier).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}