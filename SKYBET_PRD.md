# SkyBet - Aviator Crash Game Betting Platform
## Product Requirements Document (PRD)

---

## 1. EXECUTIVE SUMMARY

**SkyBet** is a mobile-first web application that offers a crash game betting experience to players in Kenya. Players can register, deposit funds via M-Pesa, and participate in real-time crash game sessions where they can multiply their bets before the game "crashes."

**Market Focus:** Kenya (M-Pesa native)
**Target Users:** Gamblers aged 18+
**MVP Launch Timeline:** 4-6 weeks

---

## 2. BRAND IDENTITY

### 2.1 Brand Values
- **Transparency**: Fair game algorithms, clear odds
- **Speed**: Fast transactions and gameplay
- **Accessibility**: Simple UI, mobile-first design
- **Trust**: Secure payment handling, regulated gameplay

### 2.2 Visual Identity
- **Logo**: Modern, minimalist design with upward trending graph element
- **Color Palette**:
  - Primary: #1E3A8A (Deep Blue) - Trust & Stability
  - Secondary: #F59E0B (Amber) - Excitement & Growth
  - Accent: #10B981 (Green) - Winning/Profits
  - Danger: #EF4444 (Red) - Crashes/Losses
- **Typography**: Inter or Roboto (clean, modern)
- **Tone**: Casual, exciting, but responsible

### 2.3 Brand Promise
"Your skill, your winnings - Fast, Fair, and in M-Pesa"
## Motto: "SkyBet - Cash Out before it Crash out"
---

## 3. PRODUCT OVERVIEW

### 3.1 Core Feature Set
1. **User Authentication**
   - Registration via phone number + name
   - OTP verification (optional but recommended)
   - Profile management

2. **Wallet Management**
   - M-Pesa deposit via Daraja API (Lipa Na M-PESA Online)
   - Real-time balance display
   - Transaction history
   - Withdrawal requests

3. **Aviator Crash Game**
   - Real-time multiplier display (1.00x → unlimited)
   - Cashout mechanism
   - Bet placement
   - Live game results
   - Game history per session

4. **Dashboard**
   - Profile overview
   - Active bets
   - Win/loss statistics
   - Recent transactions
   - Quick actions (deposit, play, withdraw)

### 3.2 Game Mechanics

**How the Game Works:**
1. Player places a bet (minimum: KES 10, maximum: KES 50,000)
2. Game starts with multiplier at 1.00x
3. Multiplier increases continuously
4. Player can "cash out" at any multiplier to win (bet × multiplier)
5. If player doesn't cash out before the "crash," they lose their bet
6. Crash happens randomly between 1.05x and 1000x (algorithm-determined)

**Example:**
- Bet: KES 100
- Cashout at 3.50x → Win: KES 350 (profit: KES 250)
- Bet: KES 100
- Crash at 2.10x before cashout → Loss: KES 0

---

## 4. TECHNOLOGY ARCHITECTURE

### 4.1 System Overview
```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│         Mobile-Responsive Web Application            │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
┌────────▼────────┐  ┌──────▼─────────┐
│  Backend API    │  │   WebSocket    │
│  (Node.js)      │  │   Server       │
│  Express        │  │  (Game Events) │
└────────┬────────┘  └──────┬─────────┘
         │                   │
         └─────────┬─────────┘
                   │
         ┌─────────▼──────────┐
         │   Database         │
         │  (PostgreSQL)      │
         └────────────────────┘
         
         ┌──────────────────────┐
         │  M-Pesa Daraja API   │
         │  (External)          │
         └──────────────────────┘
```

### 4.2 Tech Stack

**Frontend:**
- Framework: React 18+
- State Management: Redux Toolkit or Zustand
- Real-time: Socket.io (for game updates)
- Styling: Tailwind CSS
- Build Tool: Vite
- Responsive: Mobile-first design

**Backend:**
- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- ORM: Prisma
- Real-time: Socket.io
- Authentication: JWT tokens
- Environment: dotenv

**Payment Integration:**
- M-Pesa Daraja API (Lipa Na M-PESA Online)
- Callback URL handling
- Transaction logging

**Deployment:**
- Frontend: Vercel or Netlify
- Backend: Railway, Render, or Heroku
- Database: Managed PostgreSQL

---

## 5. PAYMENT SYSTEM (M-PESA)

### 5.1 M-Pesa Integration Details

**API Provider:** Safaricom Daraja
**Product:** Lipa Na M-PESA Online API (M-PESA Express)

### 5.2 Integration Flow

1. **Deposit Process:**
   ```
   User enters amount → Click "Deposit via M-Pesa" 
   → System calls Daraja API 
   → M-Pesa prompt sent to user's phone 
   → User enters M-Pesa PIN 
   → Payment confirmed → Wallet credited
   ```

2. **API Endpoints Used:**
   - Authentication: `oauth/v1/generate?grant_type=client_credentials`
   - Payment Request: `mpesa/online/v1/query` (STK Push)
   - Payment Confirmation: Callback URL

3. **Required Daraja Credentials:**
   - Consumer Key
   - Consumer Secret
   - Business Short Code (Pochi la Biashara)
   - Online Pass Key
   - Callback URL (hosted backend)

### 5.3 Security Features
- All transactions logged with timestamps
- Encrypted M-Pesa credentials (.env file)
- Callback verification (signature validation)
- Rate limiting on deposit requests
- Transaction auditing

### 5.4 Withdrawal System
- Minimum withdrawal: KES 50
- Uses M-Pesa B2C API for payouts
- 24-48 hour processing time
- Withdrawal request status tracking

---

## 6. USER FLOW

### 6.1 Registration
```
Landing Page → Enter Phone + Name → Verify Phone (OTP)
→ Create PIN → Dashboard
```

### 6.2 First Game
```
Dashboard → Click "Deposit" → M-Pesa Prompt 
→ Payment Confirmed → Dashboard 
→ Click "Play" → Game Room 
→ Place Bet → Watch Multiplier → Cashout or Lose 
→ Results Page → Play Again
```

### 6.3 Withdrawal
```
Dashboard → Wallet → Click "Withdraw" 
→ Enter Amount → Confirm → M-Pesa Received (24-48h)
```

---

## 7. DATABASE SCHEMA

### 7.1 Core Tables
- **users**: id, phone, name, email, pin_hash, balance, status, created_at, updated_at
- **wallets**: user_id, balance, currency, frozen_balance
- **transactions**: id, user_id, type (deposit/withdrawal/bet/win), amount, status, reference, created_at
- **games**: id, start_time, crash_multiplier, status, house_edge
- **bets**: id, user_id, game_id, amount, cashout_multiplier, profit, status, placed_at
- **m_pesa_callbacks**: id, phone, amount, mpesa_receipt, status, created_at

---

## 8. SECURITY & COMPLIANCE

### 8.1 Authentication
- Phone number + PIN
- JWT tokens for session management
- 30-minute session timeout
- Rate limiting (5 login attempts)

### 8.2 Data Protection
- HTTPS/TLS encryption
- Passwords never stored (PIN only)
- PCI DSS considerations for payment data
- GDPR compliance (user data privacy)

### 8.3 Fair Play
- Crash multiplier generated server-side (not client-side)
- House edge: 2-5% (configurable)
- Audit logs for all games
- Random number generation (cryptographically secure)

### 8.4 Responsible Gambling
- Daily/weekly deposit limits (configurable per user)
- Self-exclusion option
- Loss warnings
- Problem gambling resources

---

## 9. MONETIZATION & HOUSE EDGE

### 9.1 Revenue Model
- **House Edge**: 2-5% on all winning bets
- **Commission**: Taken at payout time
- **Optional Premium**: VIP features (free bets, better odds)

### 9.2 Example Economics
- Player bets KES 100 at 3.50x multiplier
- Winnings: KES 350
- House takes 3%: KES 10.50
- Player receives: KES 339.50

---

## 10. MVP SCOPE vs FUTURE

### 10.1 MVP (Phase 1)
- ✅ User registration (phone + name)
- ✅ M-Pesa deposits
- ✅ Crash game (single-player)
- ✅ Wallet & transaction history
- ✅ Basic withdrawal
- ✅ Game results & stats

### 10.2 Post-MVP (Phase 2+)
- Live multiplayer crash games
- Leaderboards & achievements
- Referral system
- VIP tiers
- Mobile apps (iOS/Android)
- Live chat & customer support
- Affiliates program
- Advanced analytics dashboard

---

## 11. TIMELINE & MILESTONES

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Design & Planning** | Week 1 | UI/UX mockups, API documentation |
| **Backend Setup** | Week 2 | API, database, M-Pesa integration |
| **Frontend Development** | Week 2-3 | UI implementation, game logic |
| **Integration & Testing** | Week 4 | End-to-end testing, M-Pesa sandbox testing |
| **Launch (Sandbox)** | Week 5 | Closed beta testing |
| **Production Launch** | Week 6 | Go live with M-Pesa production |

---

## 12. RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| Payment failures | Proper error handling, retry logic, manual support |
| Game manipulation | Server-side validation, audit logs |
| User fraud | Phone verification, KYC checks (future) |
| Server downtime | Load balancing, monitoring, backup systems |
| Regulatory issues | Compliance with Kenyan gambling laws |

---

## 13. SUCCESS METRICS (KPIs)

- **User Acquisition**: Target 1,000 users in first month
- **Daily Active Users (DAU)**: 20% of registered users
- **Average Revenue Per User (ARPU)**: KES 500/month
- **Retention Rate**: 40% week-over-week
- **Payment Success Rate**: >95%
- **Game Fairness Score**: 0 fraud incidents

---

## 14. CONTACT & SUPPORT

**For M-Pesa Integration Support:**
- Daraja Developer Portal: https://developer.safaricom.co.ke
- Daraja Sandbox: https://sandbox.safaricom.co.ke

---

**Document Version:** 1.0
**Last Updated:** April 21, 2026
**Status:** Ready for Development
