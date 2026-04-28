// pages/referral.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

export default function ReferralPage() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const { balance } = useSelector(state => state.wallet);
  const [referralInfo, setReferralInfo] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(100);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchReferralInfo();
    fetchReferrals();
  }, [token, router]);

  const fetchReferralInfo = async () => {
    try {
      const response = await fetch('/api/referral/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReferralInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching referral info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const response = await fetch('/api/referral/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const copyReferralLink = () => {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'https://skybet.com'}/ref/${referralInfo?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'https://skybet.com'}/ref/${referralInfo?.referralCode}`;
    const text = `🎮 Join SkyBet and get KES ${bonusAmount} bonus! Use my referral link: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTwitter = () => {
    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'https://skybet.com'}/ref/${referralInfo?.referralCode}`;
    const text = `🎮 Join SkyBet and get KES ${bonusAmount} bonus! Use my referral link: ${link}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
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
        <h1 className="text-2xl font-bold">Refer & Earn</h1>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Referral Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-4">🎁</div>
              <h2 className="text-3xl font-bold mb-2">
                KES {bonusAmount}
              </h2>
              <p className="text-purple-200 mb-4">
                For each friend who signs up and deposits
              </p>
              
              <div className="bg-purple-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-200 mb-2">Your Referral Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold tracking-wider">
                    {referralInfo?.referralCode || 'LOADING...'}
                  </span>
                </div>
              </div>

              <button
                onClick={copyReferralLink}
                className="w-full bg-white text-purple-800 hover:bg-purple-100 py-3 rounded-lg font-bold transition"
              >
                {copied ? '✓ Copied!' : '📋 Copy Referral Link'}
              </button>
            </div>

            {/* Share Options */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Share With Friends</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={shareOnWhatsApp}
                  className="bg-green-600 hover:bg-green-700 py-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">📱</span>
                  WhatsApp
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="bg-blue-500 hover:bg-blue-600 py-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">🐦</span>
                  Twitter
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Your Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">
                    {referralInfo?.totalReferrals || 0}
                  </p>
                  <p className="text-sm text-gray-400">Total Referrals</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">
                    {referralInfo?.completedReferrals || 0}
                  </p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">
                    KES {referralInfo?.totalEarned?.toFixed(0) || 0}
                  </p>
                  <p className="text-sm text-gray-400">Total Earned</p>
                </div>
              </div>
            </div>

            {/* Referrals List */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Recent Referrals</h3>
              {referrals.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No referrals yet. Start sharing!
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-semibold">
                          {ref.referredName?.substring(0, 10) || 'Anonymous'}***
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {ref.bonusPaid ? (
                          <span className="text-green-400 font-bold">
                            +KES {ref.bonusAmount}
                          </span>
                        ) : (
                          <span className="text-yellow-400 font-bold">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="bg-blue-900 border border-blue-700 rounded-2xl p-4 text-sm text-blue-200">
              <p className="font-bold mb-2">ℹ️ How it works:</p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Share your unique referral link with friends</li>
                <li>Friend signs up using your link</li>
                <li>Friend makes their first deposit (min KES 100)</li>
                <li>You receive KES {bonusAmount} bonus instantly!</li>
                <li>No limit on how many friends you can refer</li>
              </ol>
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
