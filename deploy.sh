#!/bin/bash

# Social Symphony Deployment Script
# This script builds and deploys the application to production

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SOURCE_DIR="/var/www/socialautoupload.com/project"
BUILD_DIR="$SOURCE_DIR/dist"
DEPLOY_DIR="/var/www/socialautoupload.com/html"
BACKUP_DIR="/var/www/socialautoupload.com/backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Step 1: Navigate to project directory
echo -e "${BLUE}📂 Navigating to project directory...${NC}"
cd "$SOURCE_DIR"

# Step 2: Create backup of current deployment
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}💾 Creating backup: $BACKUP_NAME${NC}"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cp -r "$DEPLOY_DIR"/* "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +6 | xargs -r rm -rf
    cd "$SOURCE_DIR"
fi

# Step 3: Install/Update dependencies (optional, uncomment if needed)
# echo -e "${BLUE}📦 Installing dependencies...${NC}"
# npm ci

# Step 4: Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

# Step 5: Deploy to production directory
echo -e "${BLUE}📤 Deploying to $DEPLOY_DIR...${NC}"
rsync -av --delete "$BUILD_DIR/" "$DEPLOY_DIR/"

# Step 6: Set correct permissions
echo -e "${BLUE}🔒 Setting correct permissions...${NC}"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# Step 7: Reload nginx
echo -e "${BLUE}🔄 Reloading nginx...${NC}"
systemctl reload nginx

# Step 8: Verify deployment
echo -e "${BLUE}✅ Verifying deployment...${NC}"
if [ -f "$DEPLOY_DIR/index.html" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Site: https://socialautoupload.com${NC}"
    echo -e "${GREEN}📊 Backup saved to: $BACKUP_DIR/$BACKUP_NAME${NC}"
else
    echo -e "${RED}❌ Deployment failed - index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
