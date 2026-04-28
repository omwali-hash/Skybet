// pages/wallet.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';
import { fetchWallet } from '../src/store/walletSlice';

export default function WalletPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const { balance, loading } = useSelector(state => state.wallet);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    dispatch(fetchWallet());
    // Fetch transactions
    fetch('/api/wallet', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(data.data || []))
      .catch(err => console.error('Error fetching transactions:', err));
  }, [token, dispatch]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <Header 
        balance={balance} 
        onDeposit={() => router.push('/deposit')}
        onMenu={() => router.push('/dashboard')}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-6 shadow-xl">
          <div className="text-red-200 text-sm mb-2">Available Balance</div>
          <div className="text-4xl font-bold text-white mb-4">
            KES {balance.toFixed(2)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/deposit')}
              className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition"
            >
              DEPOSIT
            </button>
            <button
              onClick={() => router.push('/withdraw')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition"
            >
              WITHDRAW
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '📱', label: 'M-Pesa', action: () => router.push('/deposit') },
            { icon: '🏦', label: 'Bank', action: () => {} },
            { icon: '🎁', label: 'Bonus', action: () => {} },
            { icon: '📊', label: 'Stats', action: () => {} },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 flex flex-col items-center gap-2 transition"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'deposit' || tx.type === 'win'
                            ? 'bg-green-600'
                            : 'bg-red-600'
                        }`}>
                          {tx.type === 'deposit' ? '📥' :
                           tx.type === 'win' ? '🎉' :
                           tx.type === 'loss' ? '😢' : '📤'}
                        </div>
                        <div>
                          <div className="font-semibold capitalize">{tx.type}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        (tx.type === 'deposit' || tx.type === 'win') && tx.status !== 'failed'
                          ? 'text-green-500'
                          : (tx.type === 'withdrawal' && tx.status === 'pending')
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}>
                        {(tx.type === 'deposit' || tx.type === 'win') && tx.status !== 'failed' ? '+' : ''}
                        {tx.type === 'withdrawal' && tx.status === 'pending' ? '-' : ''}
                        KES {Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                    {tx.status === 'pending' && (
                      <div className="text-xs text-yellow-500 mt-2">
                        Processing...
                      </div>
                    )}
                    {tx.status === 'failed' && (
                      <div className="text-xs text-red-500 mt-2">
                        Failed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
