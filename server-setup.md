# Server Setup Guide for Next.js App

## Prerequisites on Server

### 1. Node.js (v18+)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify
node --version
npm --version
```

### 2. PM2 Process Manager
```bash
sudo npm install -g pm2
```

### 3. Git (for deployment)
```bash
sudo apt install -y git  # Ubuntu/Debian
sudo yum install -y git  # CentOS/RHEL
```

## Option 1: Production Deployment (Recommended)

### Step 1: Clone and Build
```bash
# Clone your repository
git clone <your-repo-url> ai-codeneir
cd ai-codeneir

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "ai-codeneir" -- start
pm2 save
pm2 startup
```

### Step 2: Nginx Configuration (Optional)
```bash
sudo nano /etc/nginx/sites-available/ai-codeneir
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ai-codeneir /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Option 2: Development Mode (Not Recommended for Production)

### Step 1: Clone and Install
```bash
git clone <your-repo-url> ai-codeneir
cd ai-codeneir
npm install
```

### Step 2: Run in Development Mode
```bash
# Run directly (will stop when terminal closes)
npm run dev

# Or run with PM2 (keeps running)
pm2 start npm --name "ai-codeneir-dev" -- run dev
```

## Environment Variables

Create `.env.local` file if needed:
```bash
nano .env.local
```

Add any environment variables your app needs:
```
# Example - add your actual environment variables
NEXT_PUBLIC_API_URL=https://your-api.com
```

## SSL Certificate (For HTTPS)

### Using Certbot (Let's Encrypt)
```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Useful PM2 Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs ai-codeneir

# Restart app
pm2 restart ai-codeneir

# Stop app
pm2 stop ai-codeneir

# Delete app from PM2
pm2 delete ai-codeneir

# Monitor
pm2 monit
```

## Server Resources

### Minimum Requirements:
- **CPU**: 1 vCPU
- **RAM**: 1GB (2GB recommended)
- **Storage**: 10GB
- **Bandwidth**: Depends on usage

### Recommended for Production:
- **CPU**: 2+ vCPUs
- **RAM**: 2-4GB
- **Storage**: 20GB+ SSD
- **Bandwidth**: 1TB+

## Quick Deploy Script

Save this as `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying AI Codeneir App..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build the app
npm run build

# Restart PM2 process
pm2 restart ai-codeneir || pm2 start npm --name "ai-codeneir" -- start

echo "✅ Deployment complete!"
echo "🌐 App should be running at http://your-server-ip:3000"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run deployment:
```bash
./deploy.sh
```
