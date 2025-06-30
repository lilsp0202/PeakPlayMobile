#!/bin/bash

# 🎨 PeakPlay v0 UI Deployment Script
# This script helps you quickly deploy v0-generated UI components to your PWA

echo "🎨 PeakPlay v0 UI Deployment"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Your v0 UI is now live:"
    echo "   • Landing Page: Check your Vercel URL"
    echo "   • v0 Dashboard: /dashboard-v0"
    echo "   • Custom Domain: peakplayai.com (when SSL ready)"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Test your v0 components on mobile"
    echo "   2. Create more components at v0.dev"
    echo "   3. Add them to src/components/v0/"
    echo "   4. Run this script again to deploy"
    echo ""
    echo "✨ Happy coding with v0!"
else
    echo "❌ Deployment failed! Check the error messages above."
    exit 1
fi 