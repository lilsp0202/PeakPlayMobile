#!/bin/bash

# Setup script for periodic badge evaluation cron job
# This script helps set up automatic badge evaluation

echo "🔧 Setting up periodic badge evaluation..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"

# Create a wrapper script for the cron job
CRON_SCRIPT="$PROJECT_DIR/scripts/cron-badge-evaluation.sh"

cat > "$CRON_SCRIPT" << EOF
#!/bin/bash
# Cron wrapper for badge evaluation
cd "$PROJECT_DIR"
/usr/bin/env node scripts/periodic-badge-evaluation.js >> logs/badge-evaluation.log 2>&1
EOF

# Make the script executable
chmod +x "$CRON_SCRIPT"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

echo "✅ Created cron wrapper script: $CRON_SCRIPT"

# Show cron job examples
echo ""
echo "🕐 To set up automatic badge evaluation, add one of these cron jobs:"
echo ""
echo "# Every 6 hours:"
echo "0 */6 * * * $CRON_SCRIPT"
echo ""
echo "# Every hour:"
echo "0 * * * * $CRON_SCRIPT"
echo ""
echo "# Every day at 2 AM:"
echo "0 2 * * * $CRON_SCRIPT"
echo ""
echo "# Every 30 minutes:"
echo "*/30 * * * * $CRON_SCRIPT"
echo ""
echo "📝 To add a cron job, run:"
echo "   crontab -e"
echo "   Then add one of the lines above"
echo ""
echo "📊 Logs will be saved to: $PROJECT_DIR/logs/badge-evaluation.log"
echo ""
echo "🧪 To test the evaluation manually:"
echo "   node scripts/periodic-badge-evaluation.js"
echo ""
echo "✅ Setup complete!" 