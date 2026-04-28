// src/components/game/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export default function Chat() {
  const { user, token } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      setIsConnected(true);
      // Join chat room
      socketRef.current.send(JSON.stringify({
        type: 'join_chat',
        data: {
          userId: user.userId,
          name: user.name
        }
      }));
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data.data]);
      } else if (data.type === 'chat_history') {
        setMessages(data.data || []);
      } else if (data.type === 'user_joined' || data.type === 'user_left') {
        // Could update online users count
      }
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [token, user]);

  useEffect(() => {
    // Auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const profanityFilter = (text) => {
    // Basic profanity filter - in production, use a proper profanity filter library
    const bannedWords = ['fuck', 'shit', 'ass', 'bitch', 'damn'];
    const lowerText = text.toLowerCase();
    
    return bannedWords.some(word => lowerText.includes(word));
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;

    // Check for profanity
    if (profanityFilter(newMessage)) {
      alert('Please keep chat respectful. Profanity is not allowed.');
      return;
    }

    const messageData = {
      type: 'chat_message',
      data: {
        userId: user.userId,
        name: user.name,
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      }
    };

    socketRef.current.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  if (!token) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 h-64 flex items-center justify-center">
        <p className="text-gray-400">Please login to chat</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-white">💬 Live Chat</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                msg.userId === user.userId ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.userId !== user.userId && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {msg.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.userId === user.userId
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.userId !== user.userId && (
                    <span className="text-xs text-gray-400 font-semibold">
                      {msg.name}
                    </span>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              {msg.userId === user.userId && (
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            maxLength={200}
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
