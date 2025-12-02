#!/bin/bash
# =====================================================
# Setup SSL with Let's Encrypt
# =====================================================
# Usage: ./scripts/setup-ssl.sh your-domain.com your@email.com
# =====================================================

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

echo "🔐 Setting up SSL for $DOMAIN..."
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot python3-certbot-nginx
    else
        echo "❌ Could not detect package manager. Please install certbot manually."
        exit 1
    fi
fi

# Create webroot directory
sudo mkdir -p /var/www/certbot

# Get certificate
echo "🔑 Obtaining SSL certificate..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Setup auto-renewal
echo "⏰ Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet --post-hook 'nginx -s reload'") | crontab -

echo ""
echo "✅ SSL setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update nginx config with your domain:"
echo "   sed -i 's/your-domain.com/$DOMAIN/g' nginx/sites/social-publisher.conf"
echo ""
echo "2. Copy config to nginx:"
echo "   sudo cp nginx/sites/social-publisher.conf /etc/nginx/sites-available/"
echo "   sudo ln -sf /etc/nginx/sites-available/social-publisher.conf /etc/nginx/sites-enabled/"
echo ""
echo "3. Test and reload nginx:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
