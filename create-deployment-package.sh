#!/bin/bash

# Create deployment package for shared hosting

echo "📦 Creating deployment package..."

# Create a zip file with all the static files
cd out
zip -r ../ai-codeneir-static-files.zip *
cd ..

# Copy .htaccess template to the package
cp .htaccess-template ai-codeneir-static-files-htaccess.txt

echo "✅ Deployment package created!"
echo "📦 Files:"
echo "   - ai-codeneir-static-files.zip (upload and extract in public_html)"
echo "   - ai-codeneir-static-files-htaccess.txt (rename to .htaccess after upload)"
echo ""
echo "🚀 Upload instructions:"
echo "1. Upload ai-codeneir-static-files.zip to your hosting"
echo "2. Extract it in your public_html folder"
echo "3. Upload the .htaccess file to the same directory"
echo "4. Test your website!"
