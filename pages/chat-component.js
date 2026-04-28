// pages/chat-component.js - Chat component for iframe embedding
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Chat from '../src/components/game/Chat';

export default function ChatComponent() {
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    // This component is embedded via iframe
    // The actual chat logic is in the Chat component
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      {token ? (
        <Chat />
      ) : (
        <div className="text-gray-400">
          Please login to access chat
        </div>
      )}
    </div>
  );
}
