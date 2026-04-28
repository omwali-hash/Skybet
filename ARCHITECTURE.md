# SkyBet - Architecture & Technical Documentation

## PROJECT STRUCTURE

```
SkyBet/
├── README.md
├── SKYBET_PRD.md
├── ARCHITECTURE.md (this file)
├── .gitignore
├── .env.example
│
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── daraja.js           # M-Pesa Daraja config
│   │   │   └── env.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # Registration, login
│   │   │   ├── wallet.routes.js     # Deposits, withdrawals
│   │   │   ├── games.routes.js      # Game events
│   │   │   ├── bets.routes.js       # Bet placement, cashout
│   │   │   ├── mpesa.routes.js      # M-Pesa callbacks
│   │   │   └── user.routes.js       # User profile
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── walletController.js
│   │   │   ├── gameController.js
│   │   │   ├── betController.js
│   │   │   ├── mpesaController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Wallet.js
│   │   │   ├── Transaction.js
│   │   │   ├── Game.js
│   │   │   ├── Bet.js
│   │   │   └── MpesaCallback.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── services/
│   │   │   ├── daraja.service.js   # M-Pesa Daraja API
│   │   │   ├── game.service.js     # Game logic
│   │   │   ├── wallet.service.js   # Wallet operations
│   │   │   └── auth.service.js
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── websocket/
│   │   │   └── gameSocket.js       # Socket.io for real-time
│   │   │
│   │   └── app.js                  # Express app setup
│   │
│   ├── package.json
│   ├── .env
│   └── server.js                   # Entry point
│
├── frontend/                   # React web app
│   ├── public/
│   │   ├── index.html
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   └── OTPVerify.jsx
│   │   │   │
│   │   │   ├── Wallet/
│   │   │   │   ├── DepositModal.jsx
│   │   │   │   ├── WithdrawModal.jsx
│   │   │   │   ├── TransactionHistory.jsx
│   │   │   │   └── WalletBalance.jsx
│   │   │   │
│   │   │   ├── Game/
│   │   │   │   ├── GameArena.jsx      # Main game screen
│   │   │   │   ├── Multiplier.jsx     # Multiplier display
│   │   │   │   ├── BetPlacement.jsx
│   │   │   │   ├── CashoutButton.jsx
│   │   │   │   └── GameResult.jsx
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Stats.jsx
│   │   │   │   ├── RecentBets.jsx
│   │   │   │   └── QuickActions.jsx
│   │   │   │
│   │   │   └── Common/
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Input.jsx
│   │   │       └── Loader.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── GamePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js              # API calls
│   │   │   ├── socket.js           # Socket.io client
│   │   │   └── storage.js          # Local storage helpers
│   │   │
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── walletSlice.js
│   │   │   │   ├── gameSlice.js
│   │   │   │   └── uiSlice.js
│   │   │   └── store.js
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useGame.js
│   │   │   └── useWallet.js
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css           # Tailwind imports
│   │   │   ├── game.css            # Game-specific styles
│   │   │   └── animations.css
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── constants.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx                # Vite entry point
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
├── database/
│   ├── migrations/                # Prisma migrations
│   ├── schema.prisma              # Database schema
│   └── seeds.js                   # Seed data for testing
│
└── docs/                          # Documentation
    ├── API_DOCUMENTATION.md
    ├── MPESA_INTEGRATION.md
    ├── DEPLOYMENT.md
    └── CONTRIBUTING.md
```

---

## DATABASE SCHEMA (Prisma)

```prisma
// User Model
model User {
  id            String   @id @default(cuid())
  phone         String   @unique
  name          String
  pinHash       String
  email         String?
  status        String   @default("active") // active, suspended, banned
  kycVerified   Boolean  @default(false)
  dailyLimit    Float    @default(50000)   // KES
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  wallet        Wallet?
  transactions  Transaction[]
  bets          Bet[]
}

// Wallet Model
model Wallet {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  balance       Float    @default(0)
  frozenBalance Float    @default(0)  // Amount in active bets
  currency      String   @default("KES")
  updatedAt     DateTime @updatedAt
}

// Transaction Model
model Transaction {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  type          String   // "deposit", "withdrawal", "bet", "win"
  amount        Float
  status        String   // "pending", "completed", "failed"
  reference     String?  // M-Pesa receipt number
  description   String?
  createdAt     DateTime @default(now())
  
  @@index([userId])
}

// Game Model
model Game {
  id            String   @id @default(cuid())
  crashMultiplier Float
  houseEdge     Float    @default(0.03)  // 3%
  status        String   // "pending", "active", "crashed"
  startedAt     DateTime @default(now())
  endedAt       DateTime?
  
  bets          Bet[]
}

// Bet Model
model Bet {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  gameId        String
  game          Game     @relation(fields: [gameId], references: [id])
  amount        Float    // Bet amount
  cashoutMultiplier Float?
  profit        Float?
  status        String   // "active", "won", "lost", "cashed_out"
  placedAt      DateTime @default(now())
  
  @@index([userId])
  @@index([gameId])
}

// M-Pesa Callback Model
model MpesaCallback {
  id            String   @id @default(cuid())
  phone         String
  amount        Float
  mpesaReceiptId String  @unique
  transactionRef String?
  status        String   // "success", "failed"
  payload       Json     // Full callback data
  createdAt     DateTime @default(now())
}
```

---

## API ENDPOINTS

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login with phone + PIN
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile

### Wallet
- `POST /api/wallet/deposit` - Initiate M-Pesa deposit
- `POST /api/wallet/withdraw` - Withdraw to M-Pesa
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history

### Games
- `GET /api/games/current` - Get current active game
- `GET /api/games/history` - Get game history
- `POST /api/games/next` - Start new game

### Bets
- `POST /api/bets/place` - Place a bet
- `POST /api/bets/:id/cashout` - Cashout a bet
- `GET /api/bets/active` - Get active bets
- `GET /api/bets/history` - Get bet history

### M-Pesa
- `POST /api/mpesa/callback` - M-Pesa payment callback
- `POST /api/mpesa/validate` - Validate payment
- `GET /api/mpesa/status/:reference` - Check payment status

---

## REAL-TIME FEATURES (WebSocket)

```javascript
// Socket events

// Client → Server
socket.emit('join-game', { userId, gameId })
socket.emit('place-bet', { gameId, amount })
socket.emit('cashout', { gameId, betId })

// Server → Client
socket.on('multiplier-update', { multiplier, status })
socket.on('game-crashed', { crashMultiplier, winners })
socket.on('bet-placed', { betId, amount })
socket.on('cashout-success', { betId, profit })
```

---

## SECURITY CONSIDERATIONS

### M-Pesa Integration
1. **Store credentials securely** in .env (never commit)
2. **Validate callbacks** using Daraja signatures
3. **Implement webhook signature verification**
4. **Use HTTPS only** for all transactions
5. **Encrypt sensitive data** in database

### Game Fair Play
1. **Server-side validation** of all game logic
2. **Prevent client manipulation** of multipliers
3. **Audit trail** of all game results
4. **Cryptographically secure randomness** for crashes

### User Security
1. **Rate limiting** on login attempts (5 attempts/5 minutes)
2. **JWT expiration** (30 minutes)
3. **Hash PIN** using bcrypt (not passwords)
4. **Phone verification** for deposits/withdrawals

---

## DEPLOYMENT CHECKLIST

- [ ] Environment variables configured (.env)
- [ ] Database migrated and seeded
- [ ] M-Pesa credentials (sandbox → production)
- [ ] SSL certificate installed
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Logging & monitoring set up
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit performed

---

## MONITORING & LOGGING

```
Backend Logs:
- INFO: User activities, transactions
- WARN: Failed payments, suspicious activities
- ERROR: Exceptions, system errors

Metrics to track:
- Payment success rate
- Average response time
- Game crash distribution (for fairness)
- User acquisition rate
- DAU/MAU
```

---

**Next Steps:** Begin backend setup with Node.js/Express and database schema creation.
