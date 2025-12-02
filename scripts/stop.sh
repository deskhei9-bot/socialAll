#!/bin/bash
# =====================================================
# Stop Complete Stack
# =====================================================

echo "🛑 Stopping Social Publisher Stack..."
docker-compose -f docker-compose.complete.yml --profile studio down

echo ""
echo "✅ Stack stopped successfully!"
echo ""
echo "💡 To remove all data (volumes):"
echo "   docker-compose -f docker-compose.complete.yml down -v"
echo ""
