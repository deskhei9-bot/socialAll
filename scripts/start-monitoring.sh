#!/bin/bash
# =====================================================
# Start Monitoring Stack
# =====================================================

set -e

echo "📊 Starting Monitoring Stack..."
echo ""

# Create network if not exists
docker network create social-publisher_app-network 2>/dev/null || true

# Create directories
mkdir -p monitoring/prometheus/rules
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/loki
mkdir -p monitoring/promtail

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo ""
echo "🔍 Checking service health..."

if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo "✅ Prometheus: Healthy"
else
    echo "⏳ Prometheus: Starting..."
fi

if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    echo "✅ Grafana: Healthy"
else
    echo "⏳ Grafana: Starting..."
fi

if curl -s http://localhost:3100/ready > /dev/null 2>&1; then
    echo "✅ Loki: Healthy"
else
    echo "⏳ Loki: Starting..."
fi

echo ""
echo "=========================================="
echo "🎉 Monitoring Stack Started!"
echo "=========================================="
echo ""
echo "📍 Access URLs:"
echo "   Prometheus:     http://localhost:9090"
echo "   Grafana:        http://localhost:3003"
echo "   Loki:           http://localhost:3100"
echo "   Node Exporter:  http://localhost:9100/metrics"
echo "   cAdvisor:       http://localhost:8081"
echo ""
echo "🔐 Grafana Default Login:"
echo "   Username: admin"
echo "   Password: admin (change on first login)"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:      docker-compose -f docker-compose.monitoring.yml logs -f"
echo "   Stop:           docker-compose -f docker-compose.monitoring.yml down"
echo ""
