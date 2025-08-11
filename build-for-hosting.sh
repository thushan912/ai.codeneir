#!/bin/bash

# Shared Hosting Build Script
# This script prepares your Next.js app for shared hosting deployment

set -e

echo "🏗️  Building AI Codeneir for Shared Hosting..."
echo "=================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out/
rm -rf .next/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ -d "out" ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Static files are ready in the 'out' folder"
    echo "📋 File count: $(find out -type f | wc -l) files"
    echo "💾 Total size: $(du -sh out | cut -f1)"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Upload all contents from 'out' folder to your hosting public_html"
    echo "2. Create .htaccess file (see shared-hosting-guide.md)"
    echo "3. Test your website"
    echo ""
    echo "📖 For detailed instructions, see: shared-hosting-guide.md"
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi
