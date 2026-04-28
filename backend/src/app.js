// backend/src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const gameRoutes = require('./routes/games.routes');
const betRoutes = require('./routes/bets.routes');
const mpesaRoutes = require('./routes/mpesa.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/mpesa', mpesaRoutes); // Callback doesn't require auth

// Protected Routes
app.use('/api/wallet', authMiddleware, walletRoutes);
app.use('/api/games', authMiddleware, gameRoutes);
app.use('/api/bets', authMiddleware, betRoutes);
app.use('/api/user', authMiddleware, userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `${req.method} ${req.path} not found`
  });
});

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
