#!/bin/bash
# deploy.sh - Simple deployment script

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Option 1: Start with PM2 (production process manager)
    echo "🔄 Starting application with PM2..."
    pm2 stop chat-create-app 2>/dev/null || true
    pm2 start npm --name "chat-create-app" -- start
    pm2 save
    
    echo "🎉 Deployment complete!"
    echo "📊 PM2 Status:"
    pm2 status
    
    echo ""
    echo "🌐 Your app should now be running on:"
    echo "   http://localhost:3000"
    echo "   (or your server's IP address)"
    
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
