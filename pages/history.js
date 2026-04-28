// pages/history.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

export default function HistoryPage() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const { balance } = useSelector(state => state.wallet);
  
  const [bets, setBets] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bets'); // 'bets' or 'games'
  const [filter, setFilter] = useState('all'); // 'all', 'won', 'lost', 'pending'

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [token, router, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bets with filter
      const betsResponse = await fetch(`/api/user/bets?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (betsResponse.ok) {
        const betsData = await betsResponse.json();
        setBets(betsData.data || []);
      }

      // Fetch game history
      const gamesResponse = await fetch('/api/games/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        setGames(gamesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterColor = (status) => {
    if (status === 'won' || status === 'cashed_out') return 'text-green-500';
    if (status === 'lost') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getMultiplierColor = (multiplier) => {
    if (multiplier < 2) return 'text-green-600';
    if (multiplier < 5) return 'text-yellow-600';
    if (multiplier < 10) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <Header 
        balance={balance} 
        onDeposit={() => router.push('/deposit')}
        onMenu={() => router.push('/dashboard')}
      />

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">History</h1>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('bets')}
            className={`flex-1 py-2 rounded-md font-semibold transition ${
              activeTab === 'bets' ? 'bg-red-600 text-white' : 'text-gray-400'
            }`}
          >
            My Bets
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex-1 py-2 rounded-md font-semibold transition ${
              activeTab === 'games' ? 'bg-red-600 text-white' : 'text-gray-400'
            }`}
          >
            Game History
          </button>
        </div>

        {activeTab === 'bets' && (
          <div>
            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['all', 'won', 'lost', 'pending'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    filter === f
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : bets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No bets found
              </div>
            ) : (
              <div className="space-y-3">
                {bets.map((bet) => (
                  <div key={bet.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-400">Bet Amount</p>
                        <p className="text-lg font-bold">KES {bet.amount.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Result</p>
                        <p className={`font-bold capitalize ${getFilterColor(bet.status)}`}>
                          {bet.status}
                        </p>
                      </div>
                    </div>
                    
                    {bet.cashoutMultiplier && (
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">Cashout At</p>
                        <p className={`font-bold ${getMultiplierColor(bet.cashoutMultiplier)}`}>
                          {bet.cashoutMultiplier.toFixed(2)}x
                        </p>
                      </div>
                    )}
                    
                    {bet.profit !== null && (
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">Profit/Loss</p>
                        <p className={`font-bold ${bet.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {bet.profit >= 0 ? '+' : ''}KES {bet.profit.toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(bet.placedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : games.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No game history
              </div>
            ) : (
              <div className="space-y-3">
                {games.map((game) => (
                  <div key={game.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400">Game #{game.id.slice(-6)}</p>
                        <p className={`text-2xl font-bold ${getMultiplierColor(game.crashMultiplier)}`}>
                          {game.crashMultiplier.toFixed(2)}x
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Status</p>
                        <p className={`font-bold capitalize ${
                          game.status === 'crashed' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {game.status}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(game.startedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
