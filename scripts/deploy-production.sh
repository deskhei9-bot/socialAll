#!/bin/bash
# =====================================================
# Deploy to Production with SSL
# =====================================================
# Usage: ./scripts/deploy-production.sh your-domain.com your@email.com
# =====================================================

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain> [email]"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

EMAIL=${EMAIL:-"admin@$DOMAIN"}

echo "🚀 Deploying Social Publisher to Production"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "   Creating from template..."
    cp .env.complete.example .env
    echo "   Please edit .env with your values and run this script again"
    exit 1
fi

# Update domain in configs
echo "📝 Updating configuration with domain: $DOMAIN"
sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.prod.conf 2>/dev/null || true
sed -i "s/your-domain.com/$DOMAIN/g" nginx/sites/social-publisher.conf 2>/dev/null || true

# Add SITE_URL to .env if not present
if ! grep -q "SITE_URL" .env; then
    echo "SITE_URL=https://$DOMAIN" >> .env
fi

# Create required directories
echo "📁 Creating directories..."
mkdir -p nginx/ssl
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p volumes/api
mkdir -p volumes/db/init
mkdir -p volumes/storage

# Start services without SSL first (for certbot challenge)
echo "🔧 Starting services (HTTP only for initial setup)..."

# Create temporary nginx config for certbot
cat > nginx/nginx.initial.conf << 'NGINXEOF'
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name _;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'Setting up SSL...';
            add_header Content-Type text/plain;
        }
    }
}
NGINXEOF

# Start nginx with initial config
docker run -d \
    --name certbot-nginx \
    -p 80:80 \
    -v $(pwd)/nginx/nginx.initial.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/www:/var/www/certbot \
    nginx:alpine

sleep 5

# Get SSL certificate
echo "🔐 Obtaining SSL certificate..."
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Stop temporary nginx
docker stop certbot-nginx
docker rm certbot-nginx
rm nginx/nginx.initial.conf

echo "✅ SSL certificate obtained"
echo ""

# Start production stack
echo "🚀 Starting production stack..."
docker-compose -f docker-compose.production.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

# Health check
echo ""
echo "🔍 Checking service health..."

if curl -sk https://$DOMAIN/nginx-health 2>/dev/null | grep -q "healthy"; then
    echo "✅ Nginx: Healthy"
else
    echo "⏳ Nginx: Starting..."
fi

if curl -s http://localhost:3001/health 2>/dev/null | grep -q "healthy"; then
    echo "✅ Backend: Healthy"
else
    echo "⏳ Backend: Starting..."
fi

echo ""
echo "=========================================="
echo "🎉 Production Deployment Complete!"
echo "=========================================="
echo ""
echo "📍 Your app is now live at:"
echo "   https://$DOMAIN"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker-compose -f docker-compose.production.yml logs -f"
echo "   Restart:      docker-compose -f docker-compose.production.yml restart"
echo "   Stop:         docker-compose -f docker-compose.production.yml down"
echo ""
echo "🔐 SSL auto-renewal is configured via certbot container"
echo ""
