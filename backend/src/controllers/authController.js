// backend/src/controllers/authController.js
const authService = require('../services/auth.service');
const validator = require('validator');

exports.register = async (req, res, next) => {
  try {
    const { phone, name, pin } = req.body;

    // Validation
    if (!phone || !name || !pin) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Phone, name, and PIN are required'
      });
    }

    if (!validator.isMobilePhone(phone, 'en-KE')) {
      return res.status(400).json({
        error: 'Invalid phone number',
        message: 'Phone must be a valid Kenyan number'
      });
    }

    if (pin.length < 4 || pin.length > 8) {
      return res.status(400).json({
        error: 'Invalid PIN',
        message: 'PIN must be 4-8 digits'
      });
    }

    const result = await authService.registerUser(phone, name, pin);

    res.status(201).json({
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Phone and PIN are required'
      });
    }

    const result = await authService.loginUser(phone, pin);

    res.json({
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    if (error.message.includes('Invalid phone or PIN')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.userId);

    res.json({
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        balance: user.wallet.balance,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
