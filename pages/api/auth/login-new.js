// pages/api/auth/login-new.js
import authService from '../../lib/services/auth.service';
import { checkSelfExclusion } from '../../lib/middleware/responsibleGambling';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone, pin } = req.body

    if (!phone || !pin) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Phone and PIN are required'
      })
    }

    // Get user to check self-exclusion
    const user = await authService.getUserByPhone(phone)
    if (user) {
      const exclusionCheck = await checkSelfExclusion(user.id)
      if (!exclusionCheck.allowed) {
        return res.status(403).json({
          error: 'Account restricted',
          message: exclusionCheck.reason
        })
      }
    }

    const result = await authService.loginUser(phone, pin);

    res.status(200).json({
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login error:', error)
    const status = error.message.includes('Invalid') ? 401 : 500;
    res.status(status).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
