#!/bin/bash
# =====================================================
# Docker Secrets Rotation Script
# Rotates specific secrets without downtime
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
    echo "Usage: $0 <secret_name> [new_value]"
    echo ""
    echo "Arguments:"
    echo "  secret_name   Name of the secret to rotate"
    echo "  new_value     New value (will prompt if not provided)"
    echo ""
    echo "Examples:"
    echo "  $0 encryption_key"
    echo "  $0 postgres_password 'new-secure-password'"
    echo ""
    echo "Available secrets:"
    docker secret ls --format "  - {{.Name}}" 2>/dev/null || echo "  (Run in swarm mode to list)"
    exit 1
}

if [ -z "$1" ]; then
    usage
fi

SECRET_NAME="$1"
NEW_VALUE="$2"

# Check if secret exists
if ! docker secret inspect "${SECRET_NAME}" &>/dev/null; then
    log_error "Secret '${SECRET_NAME}' does not exist!"
    exit 1
fi

# Prompt for new value if not provided
if [ -z "$NEW_VALUE" ]; then
    echo -n "Enter new value for '${SECRET_NAME}': "
    read -s NEW_VALUE
    echo ""
    
    if [ -z "$NEW_VALUE" ]; then
        log_error "Value cannot be empty!"
        exit 1
    fi
fi

echo "================================================="
echo "  Rotating Secret: ${SECRET_NAME}"
echo "================================================="
echo ""

# Create new versioned secret
TIMESTAMP=$(date +%Y%m%d%H%M%S)
NEW_SECRET_NAME="${SECRET_NAME}_${TIMESTAMP}"

log_info "Creating new secret: ${NEW_SECRET_NAME}"
echo -n "$NEW_VALUE" | docker secret create "${NEW_SECRET_NAME}" -

# Find services using this secret
log_info "Finding services using this secret..."
SERVICES=$(docker service ls --format "{{.Name}}" 2>/dev/null)

for SERVICE in $SERVICES; do
    if docker service inspect "$SERVICE" --format '{{json .Spec.TaskTemplate.ContainerSpec.Secrets}}' 2>/dev/null | grep -q "\"${SECRET_NAME}\""; then
        log_info "Updating service: ${SERVICE}"
        
        # Update service to use new secret
        docker service update \
            --secret-rm "${SECRET_NAME}" \
            --secret-add "source=${NEW_SECRET_NAME},target=${SECRET_NAME}" \
            "${SERVICE}" 2>/dev/null || log_warn "Could not update ${SERVICE}"
    fi
done

# Remove old secret
log_info "Removing old secret..."
docker secret rm "${SECRET_NAME}" 2>/dev/null || true

# Rename new secret to original name
log_info "Finalizing rotation..."
OLD_VALUE=$(docker secret inspect "${NEW_SECRET_NAME}" --format '{{.Spec.Data}}' 2>/dev/null | base64 -d)
docker secret rm "${NEW_SECRET_NAME}" 2>/dev/null || true
echo -n "$NEW_VALUE" | docker secret create "${SECRET_NAME}" -

echo ""
echo "================================================="
echo "  Secret Rotated Successfully!"
echo "================================================="
echo ""
log_info "Secret '${SECRET_NAME}' has been rotated."
log_warn "Remember to restart services if they don't auto-reload:"
echo "  docker service update --force <service_name>"
echo ""
