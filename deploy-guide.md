# Server Deployment Guide

## Option 1: Production Build + PM2 (Node.js Server)

### Prerequisites
```bash
# On your server, install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
```

### Deployment Steps
```bash
# 1. Copy your project to the server
scp -r ./ai.codeneir user@your-server:/home/user/

# 2. On the server, install dependencies
cd /home/user/ai.codeneir
npm install

# 3. Build the project
npm run build

# 4. Start with PM2
pm2 start npm --name "chat-create-app" -- start
pm2 save
pm2 startup
```

## Option 2: Docker Deployment

### Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Deploy with Docker
```bash
# Build image
docker build -t chat-create-app .

# Run container
docker run -d -p 3000:3000 --name chat-app chat-create-app
```

## Option 3: Static Export (for CDN/Static Hosting)

### Modify next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### Build and Deploy
```bash
npm run build
# Upload the 'out' folder to any static host (AWS S3, Cloudflare Pages, etc.)
```

## Nginx Configuration (if using reverse proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;

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

## Environment Variables
Create `.env.production` file:
```
NODE_ENV=production
PORT=3000
```

## SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
