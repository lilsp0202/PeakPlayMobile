#!/bin/bash

# PeakPlay PWA Setup Script
echo "🚀 Setting up PeakPlay PWA..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client and setup database
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Seed database with test data
echo "🌱 Seeding database with test accounts..."
npm run db:seed

echo ""
echo "🎉 Setup complete! Your PeakPlay PWA is ready to use."
echo ""
echo "📚 Quick Start:"
echo "   1. Start the PWA server:     npm run dev"
echo "   2. Start database admin:     npm run studio"
echo "   3. Open PWA:                 http://localhost:3000"
echo "   4. Open database admin:      http://localhost:5555"
echo ""
echo "🔑 Test Accounts:"
echo "   Athlete:  student@transform.com / password123"
echo "   Coach:    coach@transform.com / password123"
echo ""
echo "Happy coding! 🏆" 