// pages/chat.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Header from '../src/components/layout/Header';
import BottomNav from '../src/components/layout/BottomNav';

export default function ChatPage() {
  const router = useRouter();
  const { user, token } = useSelector(state => state.auth);
  const { balance } = useSelector(state => state.wallet);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <Header 
        balance={balance} 
        onDeposit={() => router.push('/deposit')}
        onMenu={() => router.push('/dashboard')}
      />

      <div className="px-4 py-6 h-full">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading chat...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">{error}</div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl h-full flex flex-col">
            <div className="text-center py-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white mb-2">💬 Live Chat</h2>
              <p className="text-gray-400 text-sm">
                Chat with other players. Keep it respectful!
              </p>
            </div>
            
            {/* Chat iframe or component will go here */}
            <iframe
              src="/chat-component"
              className="flex-1 w-full h-full border-0"
              title="Live Chat"
              onError={() => setError('Failed to load chat')}
            />
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
