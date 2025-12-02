#!/bin/bash
# =====================================================
# Start Complete Stack
# =====================================================

set -e

echo "🚀 Starting Social Publisher Complete Stack..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "   Run: cp .env.complete.example .env"
    echo "   Then edit .env with your values"
    exit 1
fi

# Create required directories
mkdir -p volumes/api
mkdir -p volumes/db/init
mkdir -p volumes/storage

# Check if kong.yml exists
if [ ! -f volumes/api/kong.yml ]; then
    echo "❌ volumes/api/kong.yml not found!"
    echo "   This file should exist in your repository."
    exit 1
fi

# Check if init SQL exists
if [ ! -f volumes/db/init/001_init.sql ]; then
    echo "❌ volumes/db/init/001_init.sql not found!"
    echo "   This file should exist in your repository."
    exit 1
fi

# Start services
echo "📦 Starting services..."
docker-compose -f docker-compose.complete.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo ""
echo "🔍 Checking service health..."

# Check database
if docker exec supabase-db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database: Ready"
else
    echo "❌ Database: Not ready"
fi

# Check backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend API: Ready"
else
    echo "⏳ Backend API: Starting..."
fi

# Check frontend
if curl -s http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend: Ready"
else
    echo "⏳ Frontend: Starting..."
fi

echo ""
echo "=========================================="
echo "🎉 Stack Started Successfully!"
echo "=========================================="
echo ""
echo "📍 Access URLs:"
echo "   Frontend:        http://localhost"
echo "   Backend API:     http://localhost:3001"
echo "   Supabase API:    http://localhost:8000"
echo "   Database:        localhost:5432"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:       docker-compose -f docker-compose.complete.yml logs -f"
echo "   Stop stack:      docker-compose -f docker-compose.complete.yml down"
echo "   Restart:         docker-compose -f docker-compose.complete.yml restart"
echo ""
echo "🔧 With Studio (Dashboard):"
echo "   docker-compose -f docker-compose.complete.yml --profile studio up -d"
echo "   Access at:       http://localhost:3002"
echo ""
