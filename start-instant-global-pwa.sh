#!/bin/bash

echo "🚀 PeakPlay PWA - Instant Global Access"
echo "========================================"
echo ""

# Check if local server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Local server not running!"
    echo "   Please start with: npm run dev"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Local PWA Server: http://localhost:3000"
echo "✅ Database Studio: http://localhost:5555"
echo "✅ Network Access: http://192.168.1.75:3000"
echo ""

# Kill any existing tunnels
pkill cloudflared 2>/dev/null
sleep 2

echo "🌍 Starting global tunnel..."
echo ""

# Start Cloudflare tunnel and capture output
cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &
TUNNEL_PID=$!

echo "⏳ Waiting for tunnel to initialize..."
sleep 8

# Extract tunnel URL from logs
if [ -f tunnel.log ]; then
    TUNNEL_URL=$(grep -o 'https://.*\.trycloudflare\.com' tunnel.log | head -1)
    
    if [ ! -z "$TUNNEL_URL" ]; then
        echo ""
        echo "🎉 SUCCESS! Your PWA is now globally accessible!"
        echo ""
        echo "🌍 GLOBAL URL: $TUNNEL_URL"
        echo ""
        echo "📱 SHARE THIS URL WITH ANYONE WORLDWIDE:"
        echo "   $TUNNEL_URL"
        echo ""
        echo "🏏 How users install your PWA:"
        echo "   1. Visit: $TUNNEL_URL"
        echo "   2. Look for 'Add to Home Screen' prompt"
        echo "   3. Tap 'Add' to install like a native app"
        echo "   4. Open from home screen and enjoy!"
        echo ""
        echo "📊 Test it yourself:"
        echo "   • Open $TUNNEL_URL on your phone"
        echo "   • Try installing the PWA"
        echo "   • Test offline functionality"
        echo ""
        echo "🔧 Tunnel Management:"
        echo "   • Status: ps aux | grep cloudflared"
        echo "   • Stop: pkill cloudflared"
        echo "   • Logs: tail -f tunnel.log"
        echo ""
        echo "========================================"
        echo "🚀 PeakPlay PWA is LIVE worldwide!"
        echo "   Share: $TUNNEL_URL"
        echo "========================================"
        
        # Keep script running to show tunnel status
        echo ""
        echo "Press Ctrl+C to stop the tunnel..."
        trap "echo ''; echo '🛑 Stopping tunnel...'; pkill cloudflared; rm -f tunnel.log; echo '✅ Tunnel stopped.'; exit 0" INT
        
        while true; do
            sleep 30
            if ! ps -p $TUNNEL_PID > /dev/null; then
                echo "❌ Tunnel stopped unexpectedly. Restarting..."
                cloudflared tunnel --url http://localhost:3000 > tunnel.log 2>&1 &
                TUNNEL_PID=$!
                sleep 5
            fi
        done
        
    else
        echo "❌ Could not extract tunnel URL from logs"
        echo "   Check tunnel.log for details"
        cat tunnel.log
    fi
else
    echo "❌ Tunnel log file not created"
    echo "   Manual start: cloudflared tunnel --url http://localhost:3000"
fi 