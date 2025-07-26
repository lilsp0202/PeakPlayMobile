#!/bin/bash

echo "🚀 Starting PeakPlay Development Environment..."

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "prisma studio" 2>/dev/null

# Clear cache and regenerate Prisma client
echo "🔄 Clearing cache and regenerating Prisma client..."
rm -rf .next
npx prisma generate

# Start development server
echo "🌐 Starting development server on http://localhost:3000..."
npm run dev > dev.log 2>&1 &
DEV_PID=$!

# Wait a moment for the dev server to start
sleep 3

# Start Prisma Studio
echo "🗄️  Starting Prisma Studio on http://localhost:5555..."
npx prisma studio --port 5555 > prisma.log 2>&1 &
PRISMA_PID=$!

# Wait for services to fully start
echo "⏳ Waiting for services to start..."
sleep 8

# Verify services are running
echo "✅ Verifying services..."

if curl -s -f http://localhost:3000 > /dev/null; then
    echo "   ✅ Main App: http://localhost:3000"
else
    echo "   ❌ Main App: Failed to start"
fi

if curl -s -f http://localhost:5555 > /dev/null; then
    echo "   ✅ Prisma Studio: http://localhost:5555"
else
    echo "   ❌ Prisma Studio: Failed to start"
fi

if curl -s -f http://192.168.1.75:3000 > /dev/null; then
    echo "   ✅ PWA: http://192.168.1.75:3000"
else
    echo "   ⚠️  PWA: Not accessible (normal if not on network)"
fi

# Test database connection
echo "🔗 Testing database connection..."
DB_STATUS=$(curl -s http://localhost:3000/api/test-db 2>/dev/null | jq -r '.status // "Failed"' 2>/dev/null)
if [[ "$DB_STATUS" == "Database connected successfully" ]]; then
    echo "   ✅ Database: Connected successfully"
else
    echo "   ❌ Database: Connection failed"
fi

echo ""
echo "🎉 Development environment ready!"
echo ""
echo "📝 Access your application:"
echo "   Main App:      http://localhost:3000"
echo "   Prisma Studio: http://localhost:5555"
echo "   PWA:           http://192.168.1.75:3000"
echo ""
echo "📊 Monitor logs:"
echo "   tail -f dev.log      (development server)"
echo "   tail -f prisma.log   (prisma studio)"
echo ""
echo "⏹️  Stop services:"
echo "   pkill -f \"next dev\" && pkill -f \"prisma studio\""
echo ""
echo "🔄 Production deployment is isolated and unaffected."
echo "   Deploy when ready: git push origin main" 