#!/bin/bash
# Quick start script for SkyBet development

echo "🚀 Starting SkyBet..."

# Check prerequisites
echo "✓ Checking prerequisites..."
command -v node &> /dev/null || { echo "Node.js not installed"; exit 1; }
command -v psql &> /dev/null || { echo "PostgreSQL not installed"; exit 1; }

# Backend setup
echo "✓ Setting up backend..."
cd backend
npm install
echo "✓ Backend dependencies installed"

# Frontend setup
echo "✓ Setting up frontend..."
cd ../frontend
npm install
echo "✓ Frontend dependencies installed"

# Environment setup
echo "✓ Creating .env file..."
if [ ! -f ../.env ]; then
    cp ../.env.example ../.env
    echo "⚠️ Please configure .env file with your credentials"
    echo "   - DATABASE_URL"
    echo "   - M-Pesa Daraja credentials"
    echo "   - JWT_SECRET"
fi

echo ""
echo "✅ SkyBet setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env file with your credentials"
echo "2. Run: npm install -g prisma"
echo "3. Run: cd backend && npx prisma migrate dev --name init"
echo "4. Terminal 1: cd backend && npm run dev"
echo "5. Terminal 2: cd frontend && npm run dev"
echo "6. Open: http://localhost:3000"
echo ""
echo "Happy coding! 🎮"
