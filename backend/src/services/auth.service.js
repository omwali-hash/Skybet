// backend/src/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuthService {
  /**
   * Hash PIN with bcrypt
   */
  async hashPin(pin) {
    return bcrypt.hash(pin, 10);
  }

  /**
   * Compare PIN with hash
   */
  async verifyPin(pin, hash) {
    return bcrypt.compare(pin, hash);
  }

  /**
   * Generate JWT token
   */
  generateToken(userId, phone) {
    return jwt.sign(
      { userId, phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  /**
   * Register new user
   */
  async registerUser(phone, name, pin) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      throw new Error('Phone number already registered');
    }

    // Hash PIN
    const pinHash = await this.hashPin(pin);

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        name,
        pinHash,
        wallet: {
          create: {
            balance: 0,
            currency: 'KES'
          }
        }
      },
      include: {
        wallet: true
      }
    });

    // Generate token
    const token = this.generateToken(user.id, user.phone);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        balance: user.wallet.balance
      },
      token
    };
  }

  /**
   * Login user
   */
  async loginUser(phone, pin) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        wallet: true
      }
    });

    if (!user) {
      throw new Error('Invalid phone or PIN');
    }

    // Verify PIN
    const validPin = await this.verifyPin(pin, user.pinHash);
    if (!validPin) {
      throw new Error('Invalid phone or PIN');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const token = this.generateToken(user.id, user.phone);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        balance: user.wallet.balance,
        status: user.status
      },
      token
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = new AuthService();
