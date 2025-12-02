#!/bin/bash
# =====================================================
# Docker Secrets Initialization Script
# Creates Docker secrets from environment variables
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
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# Check if Docker Swarm is initialized
check_swarm() {
    if ! docker info 2>/dev/null | grep -q "Swarm: active"; then
        log_warn "Docker Swarm is not active. Initializing..."
        docker swarm init --advertise-addr 127.0.0.1 2>/dev/null || true
    fi
}

# Create secret from value
create_secret() {
    local name=$1
    local value=$2
    
    if [ -z "$value" ]; then
        log_warn "Skipping ${name}: value is empty"
        return
    fi
    
    # Remove existing secret if it exists
    docker secret rm "${name}" 2>/dev/null || true
    
    # Create new secret
    echo -n "$value" | docker secret create "${name}" -
    log_info "Created secret: ${name}"
}

# Create secret from file
create_secret_from_file() {
    local name=$1
    local file=$2
    
    if [ ! -f "$file" ]; then
        log_warn "Skipping ${name}: file not found: ${file}"
        return
    fi
    
    # Remove existing secret if it exists
    docker secret rm "${name}" 2>/dev/null || true
    
    # Create new secret
    docker secret create "${name}" "$file"
    log_info "Created secret from file: ${name}"
}

echo "================================================="
echo "  Docker Secrets Initialization"
echo "================================================="
echo ""

# Check for swarm mode
check_swarm

# Load environment variables
if [ -f ".env" ]; then
    log_info "Loading .env file..."
    export $(grep -v '^#' .env | xargs)
elif [ -f ".env.production" ]; then
    log_info "Loading .env.production file..."
    export $(grep -v '^#' .env.production | xargs)
else
    log_error "No .env or .env.production file found!"
    log_info "Create one from .env.complete.example first."
    exit 1
fi

log_step "Creating Supabase secrets..."
create_secret "supabase_url" "${SUPABASE_URL}"
create_secret "supabase_anon_key" "${SUPABASE_ANON_KEY}"
create_secret "supabase_service_role_key" "${SUPABASE_SERVICE_ROLE_KEY}"

log_step "Creating JWT secrets..."
create_secret "jwt_secret" "${JWT_SECRET}"
create_secret "anon_key" "${ANON_KEY}"
create_secret "service_role_key" "${SERVICE_ROLE_KEY}"

log_step "Creating database secrets..."
create_secret "postgres_password" "${POSTGRES_PASSWORD}"
create_secret "db_password" "${DB_PASSWORD:-${POSTGRES_PASSWORD}}"

log_step "Creating encryption secrets..."
create_secret "encryption_key" "${ENCRYPTION_KEY}"

log_step "Creating OAuth secrets..."
create_secret "facebook_app_id" "${FACEBOOK_APP_ID}"
create_secret "facebook_app_secret" "${FACEBOOK_APP_SECRET}"
create_secret "google_client_id" "${GOOGLE_CLIENT_ID}"
create_secret "google_client_secret" "${GOOGLE_CLIENT_SECRET}"
create_secret "tiktok_client_key" "${TIKTOK_CLIENT_KEY}"
create_secret "tiktok_client_secret" "${TIKTOK_CLIENT_SECRET}"

log_step "Creating AI API secrets..."
create_secret "openai_api_key" "${OPENAI_API_KEY}"
create_secret "gemini_api_key" "${GEMINI_API_KEY}"

echo ""
echo "================================================="
echo "  Secrets Created Successfully!"
echo "================================================="
echo ""
log_info "List all secrets: docker secret ls"
echo ""
