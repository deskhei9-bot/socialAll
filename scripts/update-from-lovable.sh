#!/bin/bash

# 🚀 Social Symphony - Update from Lovable AI
# This script pulls changes from social-weaver-ai repo and deploys to VPS

set -e  # Exit on error

echo "🔄 Starting update from Lovable AI repository..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/var/www/socialautoupload.com/project"
HTML_ROOT="/var/www/socialautoupload.com/html"

cd "$PROJECT_ROOT"

# Step 1: Pull from Lovable
echo -e "${BLUE}📥 Step 1/6: Pulling changes from social-weaver-ai...${NC}"
git pull lovable main --no-rebase || {
    echo -e "${YELLOW}⚠️  Merge conflict detected. Please resolve manually.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Git pull completed${NC}"
echo ""

# Step 2: Install backend dependencies (if package.json changed)
echo -e "${BLUE}📦 Step 2/6: Checking backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "Installing new backend dependencies..."
    npm install
else
    echo "No backend dependency changes"
fi
echo -e "${GREEN}✅ Backend dependencies checked${NC}"
echo ""

# Step 3: Build backend
echo -e "${BLUE}🔨 Step 3/6: Building backend (TypeScript)...${NC}"
npm run build
echo -e "${GREEN}✅ Backend built successfully${NC}"
echo ""

# Step 4: Restart PM2
echo -e "${BLUE}🔄 Step 4/6: Restarting backend API (PM2)...${NC}"
pm2 restart social-symphony-api
echo -e "${GREEN}✅ Backend restarted${NC}"
echo ""

# Step 5: Install frontend dependencies (if package.json changed)
echo -e "${BLUE}📦 Step 5/6: Checking frontend dependencies...${NC}"
cd "$PROJECT_ROOT"
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "Installing new frontend dependencies..."
    npm install
else
    echo "No frontend dependency changes"
fi
echo -e "${GREEN}✅ Frontend dependencies checked${NC}"
echo ""

# Step 6: Build and deploy frontend
echo -e "${BLUE}🔨 Step 6/6: Building and deploying frontend...${NC}"
npm run build

# Backup old HTML (optional)
if [ -d "$HTML_ROOT" ]; then
    BACKUP_DIR="/var/www/socialautoupload.com/backups/backup_$(date +%Y%m%d_%H%M%S)"
    echo "Creating backup at $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp -r "$HTML_ROOT"/* "$BACKUP_DIR/" 2>/dev/null || true
fi

# Deploy new build
echo "Deploying to $HTML_ROOT"
rm -rf "$HTML_ROOT"/*
cp -r dist/* "$HTML_ROOT/"
echo -e "${GREEN}✅ Frontend deployed${NC}"
echo ""

# Step 7: Push changes to origin (socialAll) to keep repos synced
echo -e "${BLUE}🔄 Syncing to socialAll repository...${NC}"
git push origin master || {
    echo -e "${YELLOW}⚠️  Could not push to origin (socialAll). You may need to push manually.${NC}"
}
echo ""

# Done!
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Update completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Live website: https://socialautoupload.com"
echo "📊 PM2 status: pm2 status"
echo "📝 PM2 logs: pm2 logs social-symphony-api"
echo ""
