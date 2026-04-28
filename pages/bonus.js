// pages/bonus.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

export default function BonusPage() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const { balance } = useSelector(state => state.wallet);
  const [loading, setLoading] = useState(false);
  const [bonusInfo, setBonusInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBonusInfo();
  }, [token, router]);

  const fetchBonusInfo = async () => {
    try {
      const response = await fetch('/api/bonus/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBonusInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching bonus info:', error);
    }
  };

  const claimBonus = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/bonus/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim bonus');
      }

      setMessage('Bonus claimed successfully!');
      setMessageType('success');
      fetchBonusInfo();
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getStreakBonus = (streak) => {
    if (streak >= 30) return 500;
    if (streak >= 21) return 300;
    if (streak >= 14) return 200;
    if (streak >= 7) return 100;
    if (streak >= 3) return 50;
    return 20;
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
        <h1 className="text-2xl font-bold">Daily Bonus</h1>

        {bonusInfo && (
          <>
            {/* Bonus Card */}
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl p-6 text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-3xl font-bold mb-2">
                KES {getStreakBonus(bonusInfo.streak)}
              </h2>
              <p className="text-yellow-200 mb-4">
                Daily Login Bonus
              </p>
              
              {!bonusInfo.canClaim ? (
                <div className="bg-yellow-900 rounded-lg p-4">
                  <p className="text-sm text-yellow-200">
                    Come back in {bonusInfo.hoursRemaining}h {bonusInfo.minutesRemaining}m
                  </p>
                </div>
              ) : (
                <button
                  onClick={claimBonus}
                  disabled={loading}
                  className="w-full bg-white text-yellow-800 hover:bg-yellow-100 disabled:bg-gray-400 py-4 rounded-lg font-bold text-lg transition"
                >
                  {loading ? 'Claiming...' : 'Claim Bonus'}
                </button>
              )}
            </div>

            {/* Streak Info */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">🔥 Login Streak</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl font-bold text-orange-400">
                  {bonusInfo.streak}
                </span>
                <span className="text-gray-400">days</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Streak Bonus</span>
                  <span className="text-green-400 font-bold">
                    KES {getStreakBonus(bonusInfo.streak)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Next Milestone</span>
                  <span className="text-yellow-400 font-bold">
                    {bonusInfo.streak < 3 ? '3 days' : 
                     bonusInfo.streak < 7 ? '7 days' :
                     bonusInfo.streak < 14 ? '14 days' :
                     bonusInfo.streak < 21 ? '21 days' :
                     bonusInfo.streak < 30 ? '30 days' : 'MAX'}
                  </span>
                </div>
              </div>

              {/* Streak Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress to next bonus</span>
                  <span>{bonusInfo.streak % 7}/7 days</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${(bonusInfo.streak % 7) / 7 * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Bonus Tiers */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">💰 Bonus Tiers</h3>
              <div className="space-y-3">
                {[
                  { days: 1, bonus: 20, icon: '🌟' },
                  { days: 3, bonus: 50, icon: '🔥' },
                  { days: 7, bonus: 100, icon: '⚡' },
                  { days: 14, bonus: 200, icon: '💎' },
                  { days: 21, bonus: 300, icon: '👑' },
                  { days: 30, bonus: 500, icon: '🏆' }
                ].map((tier) => (
                  <div
                    key={tier.days}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      bonusInfo.streak >= tier.days
                        ? 'bg-green-900 border border-green-700'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <p className="font-semibold">{tier.days} Day Streak</p>
                        <p className="text-xs text-gray-400">
                          {bonusInfo.streak >= tier.days ? 'Unlocked!' : `Current: ${bonusInfo.streak} days`}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      bonusInfo.streak >= tier.days ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      KES {tier.bonus}
                    </span>
                  </div>
                ))}
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

            {/* Info */}
            <div className="bg-blue-900 border border-blue-700 rounded-2xl p-4 text-sm text-blue-200">
              <p className="font-bold mb-2">ℹ️ How it works:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Login daily to claim your bonus</li>
                <li>Longer streaks = bigger bonuses</li>
                <li>Miss a day and your streak resets</li>
                <li>Bonus is credited instantly to your wallet</li>
              </ul>
            </div>
          </>
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
