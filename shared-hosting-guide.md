# Shared Hosting Deployment Guide

## Overview
This guide will help you deploy your AI Codeneir app to shared hosting providers like cPanel, Hostinger, GoDaddy, Bluehost, etc.

## Prerequisites
- Access to your shared hosting control panel (cPanel or similar)
- File Manager or FTP access
- Node.js support (if available) or static file hosting

## Method 1: Static Export (Recommended for Shared Hosting)

### Step 1: Build the Static Version
Run this command in your local development environment:

```bash
npm run build
```

This will create a static version of your app in the `out` folder.

### Step 2: Upload to Shared Hosting

#### Option A: Using cPanel File Manager
1. Login to your cPanel
2. Open "File Manager"
3. Navigate to `public_html` (or your domain's document root)
4. Upload the contents of the `out` folder (not the folder itself)
5. Extract/upload all files and folders

#### Option B: Using FTP Client (FileZilla, WinSCP, etc.)
1. Connect to your hosting via FTP
2. Navigate to `public_html` or your domain's root directory
3. Upload all contents from the `out` folder
4. Ensure all files are uploaded completely

### Step 3: Configure for Shared Hosting

#### Create .htaccess file (for Apache servers)
Create this file in your domain's root directory:

```apache
# .htaccess for Next.js static export
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L,QSA]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compress files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## Method 2: Node.js Hosting (If Supported)

### Prerequisites
- Shared hosting provider supports Node.js
- SSH access (some providers offer this)

### Step 1: Upload Source Code
1. Upload your entire project to your hosting account
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Start the application: `npm start`

### Step 2: Configure Start Script
Some shared hosting providers require specific configurations. Check with your provider for:
- Node.js version support
- Port requirements
- Process management

## Troubleshooting Common Issues

### Issue 1: Images Not Loading
If images aren't loading properly, check:
1. All image files are uploaded correctly
2. File paths are correct (case-sensitive on Linux servers)
3. Image optimization is disabled in next.config.ts

### Issue 2: Routing Not Working
If page routing doesn't work:
1. Ensure `.htaccess` file is uploaded (for Apache)
2. For Nginx servers, contact hosting support for URL rewrite rules
3. Check if `trailingSlash: true` is set in next.config.ts

### Issue 3: API Routes Not Working
Static export doesn't support API routes. If you need backend functionality:
1. Use external APIs
2. Convert to client-side only functionality
3. Consider serverless functions if supported

### Issue 4: Performance Issues
To improve performance:
1. Enable compression in .htaccess
2. Use CDN if available
3. Optimize images before uploading
4. Enable browser caching

## File Structure After Upload
Your hosting root should look like this:
```
public_html/
├── _next/
├── images/
├── index.html
├── chat.html
├── image-studio.html
├── .htaccess
└── ... (other static files)
```

## Testing Your Deployment
1. Visit your domain in a web browser
2. Test all pages and navigation
3. Check browser console for any errors
4. Test on mobile devices
5. Verify all images and assets load correctly

## Popular Shared Hosting Providers
This guide works with:
- **cPanel-based hosting**: Hostinger, Bluehost, SiteGround
- **DirectAdmin**: Some budget providers
- **Custom panels**: GoDaddy, Namecheap
- **File-only hosting**: Any provider that serves static files

## Security Notes
- Never upload `.env` files with sensitive data
- Use HTTPS if available (most providers offer free SSL)
- Keep your domain and hosting account secure
- Regularly update your static files

## Quick Deploy Checklist
- [ ] Build static version: `npm run build`
- [ ] Upload `out` folder contents to `public_html`
- [ ] Create `.htaccess` file
- [ ] Test website functionality
- [ ] Check mobile responsiveness
- [ ] Verify all assets load correctly

## Support
If you encounter issues:
1. Check your hosting provider's documentation
2. Contact their support team
3. Verify Node.js/static file support
4. Test locally first with `npm run build && npx serve out`
