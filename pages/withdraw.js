// pages/withdraw.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

export default function WithdrawPage() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const { balance } = useSelector(state => state.wallet);
  const [amount, setAmount] = useState(100);
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState(null);

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!phone) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (amount < 50) {
      setError('Minimum withdrawal is KES 50');
      setLoading(false);
      return;
    }

    if (amount > 50000) {
      setError('Maximum withdrawal is KES 50,000');
      setLoading(false);
      return;
    }

    if (amount > balance) {
      setError('Insufficient balance');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      setSuccess(true);
      setWithdrawalData(data.data);
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
        balance={balance} 
        onDeposit={() => router.push('/deposit')}
        onMenu={() => router.push('/dashboard')}
      />

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Withdraw to M-Pesa</h1>

        {success ? (
          <div className="bg-green-900 border border-green-700 rounded-2xl p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">Withdrawal Initiated!</h2>
            <p className="text-green-200 mb-4">
              KES {withdrawalData?.amount?.toLocaleString()} will be sent to {withdrawalData?.phone}
            </p>
            <div className="bg-green-800 rounded-lg p-4 text-sm text-green-200">
              <p className="mb-2">
                <strong>Transaction ID:</strong> {withdrawalData?.transactionId?.slice(-8)}
              </p>
              <p className="mb-2">
                <strong>Processing Time:</strong> 24-48 hours
              </p>
              <p>
                You will receive the money directly in your M-Pesa account.
              </p>
            </div>
            <button
              onClick={() => router.push('/wallet')}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition"
            >
              Back to Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-6">
              <div className="text-red-200 text-sm mb-2">Available Balance</div>
              <div className="text-3xl font-bold text-white">
                KES {balance.toFixed(2)}
              </div>
            </div>

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
                min="50"
                max={balance}
                required
              />
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  disabled={amt > balance}
                  className={`py-3 rounded-lg font-bold transition text-sm ${
                    amount === amt
                      ? 'bg-green-600 text-white'
                      : amt > balance
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            {/* Withdrawal Limits Info */}
            <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
              <p className="mb-2">• Minimum withdrawal: <strong className="text-white">KES 50</strong></p>
              <p className="mb-2">• Maximum withdrawal: <strong className="text-white">KES 50,000</strong></p>
              <p>• Processing time: <strong className="text-white">24-48 hours</strong></p>
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
              disabled={loading || amount > balance}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-lg font-bold text-lg transition"
            >
              {loading ? 'Processing...' : `Withdraw KES ${amount.toLocaleString()}`}
            </button>

            {/* Warning */}
            <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm">
              <strong>⚠️ Warning:</strong> Withdrawals are processed within 24-48 hours. 
              Make sure your M-Pesa number is correct. Withdrawals cannot be reversed once processed.
            </div>
          </form>
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
