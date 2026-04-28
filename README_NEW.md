# SkyBet - Aviator Crash Game

A full-stack Aviator crash game betting platform built with Next.js, featuring M-Pesa integration for Kenyan users.

## Features

- 🎮 **Aviator Crash Game** - Real-time multiplayer betting game
- 💰 **M-Pesa Integration** - Secure payments via Safaricom's Daraja API
- 🔐 **User Authentication** - JWT-based auth with PIN security
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS
- ⚡ **Real-time Updates** - Socket.io for live game updates
- 🗄️ **PostgreSQL Database** - Robust data storage with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 13, React, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: M-Pesa Daraja API
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- M-Pesa Daraja API credentials (for production)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your configuration.

3. **Set up the database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skybet"

# JWT
JWT_SECRET="your_super_secret_jwt_key"

# M-Pesa Daraja API
MPESA_CONSUMER_KEY="your_consumer_key"
MPESA_CONSUMER_SECRET="your_consumer_secret"
MPESA_BUSINESS_CODE="174379"
MPESA_ONLINE_PASSKEY="your_online_passkey"
MPESA_ENVIRONMENT="sandbox"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/wallet/deposit` - M-Pesa deposit
- `GET /api/wallet/balance` - Get user balance
- `POST /api/games/bet` - Place a bet
- `POST /api/games/cashout` - Cash out winnings

## Game Rules

1. **Betting Phase**: Place your bet before the plane takes off
2. **Flight Phase**: Watch the multiplier increase as the plane flies
3. **Cash Out**: Click to cash out before the plane crashes
4. **Crash**: If you don't cash out in time, you lose your bet

## M-Pesa Integration

The app integrates with M-Pesa's STK Push API for secure deposits:

1. User enters amount and phone number
2. STK Push sent to user's phone
3. User confirms payment on their phone
4. Funds credited to account instantly

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Set up PostgreSQL database (e.g., Neon, Supabase)
4. Deploy!

### Manual Deployment

1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Set up reverse proxy (nginx) for production
4. Configure SSL certificate

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This is a gambling application. Please gamble responsibly. The developers are not responsible for any financial losses incurred through the use of this application.