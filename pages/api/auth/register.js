// pages/api/auth/register.js
import authService from '@/lib/services/auth.service';
import prisma from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone, name, pin, referralCode } = req.body

    // Validation
    if (!phone || !name || !pin) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Phone, name, and PIN are required'
      })
    }

    const result = await authService.registerUser(phone, name, pin);

    // Handle referral code if provided
    if (referralCode && result.userId) {
      try {
        // Find referrer by referral code
        const referrer = await prisma.user.findUnique({
          where: { referralCode: referralCode.toUpperCase() }
        })

        if (referrer && referrer.id !== result.userId) {
          // Create referral record
          await prisma.referral.create({
            data: {
              referrerId: referrer.id,
              referredId: result.userId,
              referralCode: referralCode.toUpperCase()
            }
          })
        }
      } catch (referralError) {
        // Don't fail registration if referral processing fails
        console.error('Referral processing error:', referralError)
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    console.error('Register error:', error)
    const status = error.message.includes('already') ? 400 : 500;
    res.status(status).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}