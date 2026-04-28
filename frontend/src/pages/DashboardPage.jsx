// frontend/src/pages/DashboardPage.jsx
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'

const DashboardPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handlePlayGame = () => {
    navigate('/game')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SkyBet</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <p className="text-gray-600">Name: <span className="font-semibold">{user?.name}</span></p>
            <p className="text-gray-600">Phone: <span className="font-semibold">{user?.phone}</span></p>
          </div>

          {/* Balance Card */}
          <div className="card bg-gradient-to-br from-amber-400 to-amber-600 text-white">
            <h2 className="text-xl font-bold mb-4">Wallet Balance</h2>
            <p className="text-4xl font-bold">KES {user?.balance || 0}</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-secondary">Deposit</button>
              <button className="btn-secondary">Withdraw</button>
            </div>
          </div>
        </div>

        {/* Game Section */}
        <div className="mt-8 card">
          <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-gray-600 mb-6">
            Experience the thrill of the Aviator crash game. Place your bets and cash out before the crash!
          </p>
          <button
            onClick={handlePlayGame}
            className="btn-secondary text-lg px-6 py-3"
          >
            Play Game
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-gray-600">Total Bets</p>
            <p className="text-3xl font-bold text-blue-900">0</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-600">Win Rate</p>
            <p className="text-3xl font-bold text-green-600">0%</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-600">Total Profit</p>
            <p className="text-3xl font-bold text-amber-600">KES 0</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
