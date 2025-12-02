#!/bin/bash
# =====================================================
# Docker Secrets List Script
# Lists all secrets with metadata
# =====================================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "================================================="
echo "  Docker Secrets Overview"
echo "================================================="
echo ""

# Check if swarm is active
if ! docker info 2>/dev/null | grep -q "Swarm: active"; then
    echo -e "${YELLOW}[WARN]${NC} Docker Swarm is not active."
    echo "Initialize with: docker swarm init"
    exit 1
fi

# List secrets
echo -e "${CYAN}Available Secrets:${NC}"
echo ""
printf "%-35s %-25s %-20s\n" "NAME" "CREATED" "UPDATED"
printf "%-35s %-25s %-20s\n" "----" "-------" "-------"

docker secret ls --format "{{.Name}}\t{{.CreatedAt}}\t{{.UpdatedAt}}" 2>/dev/null | while IFS=$'\t' read -r name created updated; do
    printf "%-35s %-25s %-20s\n" "$name" "$created" "$updated"
done

echo ""

# Group secrets by category
echo -e "${CYAN}Secrets by Category:${NC}"
echo ""

echo -e "${GREEN}Database:${NC}"
docker secret ls --format "  - {{.Name}}" 2>/dev/null | grep -E "postgres|db_" || echo "  (none)"
echo ""

echo -e "${GREEN}Supabase:${NC}"
docker secret ls --format "  - {{.Name}}" 2>/dev/null | grep -E "supabase|anon_key|service_role" || echo "  (none)"
echo ""

echo -e "${GREEN}OAuth Providers:${NC}"
docker secret ls --format "  - {{.Name}}" 2>/dev/null | grep -E "facebook|google|tiktok" || echo "  (none)"
echo ""

echo -e "${GREEN}AI Services:${NC}"
docker secret ls --format "  - {{.Name}}" 2>/dev/null | grep -E "openai|gemini|anthropic" || echo "  (none)"
echo ""

echo -e "${GREEN}Security:${NC}"
docker secret ls --format "  - {{.Name}}" 2>/dev/null | grep -E "jwt|encryption|secret" || echo "  (none)"
echo ""

# Show total count
TOTAL=$(docker secret ls -q 2>/dev/null | wc -l)
echo "================================================="
echo "  Total Secrets: ${TOTAL}"
echo "================================================="
