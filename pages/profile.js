// pages/profile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';
import { logout } from '../src/store/authSlice';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const { balance } = useSelector(state => state.wallet);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  
  // Change PIN form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  // Daily limit
  const [dailyLimit, setDailyLimit] = useState(user?.dailyLimit || 50000);
  
  // Stats
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWins: 0,
    totalLosses: 0,
    profit: 0,
    winRate: 0
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchStats();
  }, [token, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!currentPin || !newPin || !confirmPin) {
      setMessage('All PIN fields are required');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setMessage('PIN must be between 4 and 8 digits');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newPin !== confirmPin) {
      setMessage('New PINs do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/update-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPin, newPin })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update PIN');
      }

      setMessage('PIN updated successfully');
      setMessageType('success');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/update-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ dailyLimit })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update limit');
      }

      setMessage('Daily limit updated successfully');
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleSelfExclude = async (duration) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/self-exclude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ duration })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set self-exclusion');
      }

      setMessage('Self-exclusion activated. You will be logged out.');
      setMessageType('success');
      setShowExclusionModal(false);

      setTimeout(() => {
        dispatch(logout());
        router.push('/login');
      }, 2000);
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <Header 
        balance={balance} 
        onDeposit={() => router.push('/deposit')}
        onMenu={() => router.push('/dashboard')}
      />

      <div className="px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>

        {/* User Info Card */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">✈️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-400">{user?.phone}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <p>Member since: {new Date(user?.createdAt).toLocaleDateString()}</p>
            <p>Status: <span className="text-green-400">Active</span></p>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Bets</p>
              <p className="text-2xl font-bold">{stats.totalBets}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Wins</p>
              <p className="text-2xl font-bold text-green-400">{stats.totalWins}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Losses</p>
              <p className="text-2xl font-bold text-red-400">{stats.totalLosses}</p>
            </div>
            <div className="col-span-2 bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Net Profit/Loss</p>
              <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                KES {stats.profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Change PIN */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Change PIN</h3>
          <form onSubmit={handleChangePin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current PIN</label>
              <input
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                maxLength="8"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">New PIN</label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                maxLength="8"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm New PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                maxLength="8"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg font-bold transition"
            >
              {loading ? 'Updating...' : 'Update PIN'}
            </button>
          </form>
        </div>

        {/* Daily Deposit Limit */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Daily Deposit Limit</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Maximum Daily Deposit (KES)</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                min="1000"
                max="500000"
                step="1000"
              />
            </div>
            <button
              onClick={handleUpdateLimit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg font-bold transition"
            >
              {loading ? 'Updating...' : 'Update Limit'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg ${
            messageType === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold transition"
        >
          Logout
        </button>

        {/* Responsible Gambling */}
        <div className="bg-yellow-900 border border-yellow-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-2">🎯 Responsible Gambling</h3>
          <p className="text-sm text-yellow-200 mb-4">
            Gambling should be fun and entertaining. If you feel you're losing control, please seek help.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => setShowExclusionModal(true)}
              className="w-full bg-yellow-800 hover:bg-yellow-700 py-2 rounded-lg text-sm transition"
            >
              Set Self-Exclusion
            </button>
          </div>
        </div>

        {/* Self-Exclusion Modal */}
        {showExclusionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Self-Exclusion</h3>
              <p className="text-gray-400 mb-6">
                Choose how long you want to exclude yourself from the platform. During this period, you won't be able to place bets or make deposits.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleSelfExclude('24h')}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded-lg font-bold transition"
                >
                  24 Hours
                </button>
                <button
                  onClick={() => handleSelfExclude('7d')}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded-lg font-bold transition"
                >
                  7 Days
                </button>
                <button
                  onClick={() => handleSelfExclude('30d')}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded-lg font-bold transition"
                >
                  30 Days
                </button>
                <button
                  onClick={() => handleSelfExclude('permanent')}
                  disabled={loading}
                  className="w-full bg-red-900 hover:bg-red-950 disabled:bg-gray-600 py-3 rounded-lg font-bold transition"
                >
                  Permanent (Cannot be undone)
                </button>
                <button
                  onClick={() => setShowExclusionModal(false)}
                  disabled={loading}
                  className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 py-3 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav 
        onWallet={() => router.push('/wallet')}
        onPlay={() => router.push('/')}
        onDeposit={() => router.push('/deposit')}
        onWithdraw={() => router.push('/withdraw')}
        onChat={() => router.push('/chat')}
      />
    </div>
  );
}
