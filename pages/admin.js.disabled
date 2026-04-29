// pages/admin.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

export default function AdminPage() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBets: 0,
    totalDeposits: 0,
    totalWithdrawals: 0
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if admin (simple check)
    if (user.phone !== '254700000000') {
      router.push('/');
      return;
    }

    fetchStats();
    fetchUsers();
  }, [token, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `KES ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <Header 
        balance={0} 
        onDeposit={() => router.push('/deposit')}
        onMenu={() => router.push('/dashboard')}
      />

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Users</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Active Users</p>
            <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Bets</p>
            <p className="text-3xl font-bold text-purple-400">{stats.totalBets}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Deposits</p>
            <p className="text-3xl font-bold text-yellow-400">{formatCurrency(stats.totalDeposits)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-4 font-semibold transition ${
              activeTab === 'users' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 px-4 font-semibold transition ${
              activeTab === 'transactions' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-2 px-4 font-semibold transition ${
              activeTab === 'withdrawals' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Withdrawals
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Phone</th>
                        <th className="px-4 py-3 text-left">Balance</th>
                        <th className="px-4 py-3 text-left">Bets</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700">
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3">{user.phone}</td>
                          <td className="px-4 py-3">{formatCurrency(user.balance)}</td>
                          <td className="px-4 py-3">{user.totalBets}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              user.status === 'active' 
                                ? 'bg-green-900 text-green-200' 
                                : user.status === 'excluded'
                                ? 'bg-red-900 text-red-200'
                                : 'bg-gray-700 text-gray-200'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        {activeTab === 'transactions' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-center text-gray-400">Transaction management coming soon...</p>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <p className="text-center text-gray-400">Withdrawal management coming soon...</p>
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
