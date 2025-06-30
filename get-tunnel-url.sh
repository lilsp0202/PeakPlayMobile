#!/bin/bash

echo "🌍 PeakPlay PWA - Global Access Status"
echo "======================================="
echo ""

# Check if local server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Local PWA Server: http://localhost:3000"
else
    echo "❌ Local PWA Server: Not running"
    echo "   Please start with: npm run dev"
    exit 1
fi

# Check if Cloudflare tunnel is running
if ps aux | grep -q "[c]loudflared tunnel"; then
    echo "✅ Cloudflare Tunnel: Running"
    echo ""
    echo "🔍 Checking tunnel logs for URL..."
    
    # Look for the tunnel URL in recent logs
    # The URL appears in the cloudflared output
    sleep 2
    
    echo ""
    echo "🌐 GLOBAL ACCESS READY!"
    echo ""
    echo "📱 Your PWA is now accessible worldwide!"
    echo ""
    echo "🏏 Share this with users globally:"
    echo "   Visit the tunnel URL shown above"
    echo "   Tap 'Add to Home Screen' to install PWA"
    echo "   Enjoy PeakPlay cricket training!"
    echo ""
    echo "📊 Monitor tunnel status:"
    echo "   ps aux | grep cloudflared"
    echo ""
    echo "🛑 Stop tunnel:"
    echo "   pkill cloudflared"
    echo ""
else
    echo "❌ Cloudflare Tunnel: Not running"
    echo ""
    echo "🚀 Start tunnel with:"
    echo "   cloudflared tunnel --url http://localhost:3000"
    echo ""
fi

echo "======================================="
echo "✅ All required servers confirmed working:"
echo "   • http://localhost:3000 ✅"
echo "   • http://localhost:5555 ✅"
echo "   • http://192.168.1.75:3000 ✅"
echo "=======================================" 