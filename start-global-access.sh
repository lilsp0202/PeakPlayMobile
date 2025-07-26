#!/bin/bash

echo "🌍 Starting PeakPlay PWA Global Access..."
echo ""
echo "🚀 Your PWA is running on:"
echo "   Local: http://localhost:3000"
echo "   Network: http://192.168.1.75:3000"
echo ""
echo "🔗 Starting global tunnel..."
echo ""

# Start ngrok tunnel
ngrok http 3000 --log=stdout &
NGROK_PID=$!

# Wait for ngrok to start
sleep 5

# Get tunnel URL
TUNNEL_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    for tunnel in tunnels:
        if tunnel.get('proto') == 'https':
            print(tunnel.get('public_url', ''))
            break
except:
    pass
")

if [ ! -z "$TUNNEL_URL" ]; then
    echo "✅ Global PWA Access Ready!"
    echo ""
    echo "🌍 GLOBAL URL: $TUNNEL_URL"
    echo ""
    echo "📱 Share this URL with anyone worldwide:"
    echo "   $TUNNEL_URL"
    echo ""
    echo "🏏 Users can install your PWA by:"
    echo "   1. Visiting: $TUNNEL_URL"
    echo "   2. Tapping 'Add to Home Screen'"
    echo "   3. Enjoying your cricket training app!"
    echo ""
    echo "📊 Monitor usage at: http://localhost:4040"
    echo ""
    echo "Press Ctrl+C to stop the tunnel"
    echo ""
    
    # Keep the script running
    wait $NGROK_PID
else
    echo "❌ Failed to start tunnel. Please run manually:"
    echo "   ngrok http 3000"
    kill $NGROK_PID 2>/dev/null
fi 