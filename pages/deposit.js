// pages/deposit.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

function DepositPageComponent() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);

  // Redirect to login if not authenticated
  if (typeof window !== 'undefined' && !token) {
    router.push('/login');
    return null;
  }
  const [amount, setAmount] = useState(100);
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [100, 500, 1000, 5000];

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!phone) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (amount < 10) {
      setError('Minimum deposit is KES 10');
      setLoading(false);
      return;
    }

    try {
      // Call M-Pesa STK Push API
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deposit failed');
      }

      alert('Check your phone to complete M-Pesa payment');
      router.push('/wallet');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <Header 
        balance={user?.balance || 0} 
        onDeposit={() => {}}
        onMenu={() => router.push('/dashboard')}
      />

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Deposit via M-Pesa</h1>

        <form onSubmit={handleDeposit} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712345678"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Amount (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-2xl font-bold"
              min="10"
              required
            />
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-3">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`py-3 rounded-lg font-bold transition ${
                  amount === amt
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-4 rounded-lg font-bold text-lg transition"
          >
            {loading ? 'Processing...' : `Deposit KES ${amount}`}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-2">How it works:</h3>
          <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
            <li>Enter your M-Pesa phone number</li>
            <li>Select or enter deposit amount</li>
            <li>Click Deposit button</li>
            <li>Check your phone for M-Pesa prompt</li>
            <li>Enter M-Pesa PIN to complete</li>
            <li>Balance updated instantly!</li>
          </ol>
        </div>
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

export default dynamic(() => Promise.resolve(DepositPageComponent), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
