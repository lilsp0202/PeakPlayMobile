#!/bin/bash

echo "�� Starting PeakPlay PWA with Network Access..."
echo ""

# Kill existing dev server if running
echo "🔄 Stopping existing dev server..."
pkill -f "next dev" || true
sleep 2

# Start Next.js with network binding
echo "🌍 Starting Next.js with network access..."
echo "   Local: http://localhost:3000"
echo "   Network: http://192.168.1.75:3000"
echo ""

# Start Next.js dev server with hostname binding for network access
npm run dev -- --hostname 0.0.0.0 &

# Start Prisma Studio if not already running
if ! lsof -i :5555 > /dev/null; then
    echo "🗃️ Starting Prisma Studio..."
    npm exec prisma studio --port 5555 &
fi

echo ""
echo "✅ PWA Services Started!"
echo "   📱 Main App: http://localhost:3000"
echo "   🗃️ Database: http://localhost:5555" 
echo "   🌍 PWA Network: http://192.168.1.75:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for services to start
sleep 3

# Keep script running
wait
