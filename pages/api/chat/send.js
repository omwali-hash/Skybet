// pages/api/chat/send.js
import prisma from '@/lib/db'
import { authMiddleware } from '@/lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, error } = authMiddleware(req)
  if (error) {
    return res.status(401).json({ error })
  }

  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message required',
        message: 'Message cannot be empty'
      })
    }

    if (message.length > 200) {
      return res.status(400).json({
        error: 'Message too long',
        message: 'Message cannot exceed 200 characters'
      })
    }

    // Basic profanity filter
    const bannedWords = ['fuck', 'shit', 'ass', 'bitch', 'damn'];
    const hasProfanity = bannedWords.some(word => 
      message.toLowerCase().includes(word)
    );

    if (hasProfanity) {
      return res.status(400).json({
        error: 'Profanity detected',
        message: 'Please keep chat respectful'
      })
    }

    // Store message (in production, you might want to store in database)
    const chatMessage = {
      userId: user.userId,
      name: user.name,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Broadcast to WebSocket clients
    if (global.ws && global.ws.clients) {
      const broadcast = {
        type: 'chat_message',
        data: chatMessage
      };
      
      global.ws.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(broadcast));
        }
      });
    }

    res.status(200).json({
      message: 'Message sent'
    })
  } catch (error) {
    console.error('Chat send error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
