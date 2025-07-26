#!/bin/bash

echo "🛑 Stopping PeakPlay Development Environment..."

# Stop development processes
echo "🧹 Stopping development server..."
pkill -f "next dev" 2>/dev/null

echo "🗄️  Stopping Prisma Studio..."
pkill -f "prisma studio" 2>/dev/null

# Wait a moment for processes to fully stop
sleep 2

# Verify processes are stopped
DEV_RUNNING=$(pgrep -f "next dev" 2>/dev/null)
PRISMA_RUNNING=$(pgrep -f "prisma studio" 2>/dev/null)

if [[ -z "$DEV_RUNNING" ]]; then
    echo "   ✅ Development server stopped"
else
    echo "   ⚠️  Development server still running (PID: $DEV_RUNNING)"
fi

if [[ -z "$PRISMA_RUNNING" ]]; then
    echo "   ✅ Prisma Studio stopped"
else
    echo "   ⚠️  Prisma Studio still running (PID: $PRISMA_RUNNING)"
fi

echo ""
echo "📝 Log files preserved:"
echo "   dev.log      (development server logs)"
echo "   prisma.log   (prisma studio logs)"
echo ""
echo "🚀 To restart: ./start-dev.sh"
echo "🔄 Production deployment remains unaffected." 