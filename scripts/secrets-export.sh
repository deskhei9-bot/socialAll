#!/bin/bash
# =====================================================
# Docker Secrets Export Script
# Exports secrets for backup (encrypted)
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

BACKUP_DIR="${BACKUP_DIR:-./secrets-backup}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/secrets_${TIMESTAMP}.enc"

echo "================================================="
echo "  Docker Secrets Export (Encrypted)"
echo "================================================="
echo ""

# Check for gpg
if ! command -v gpg &> /dev/null; then
    log_error "GPG is required for encrypted export. Install with:"
    echo "  Ubuntu/Debian: apt-get install gnupg"
    echo "  macOS: brew install gnupg"
    exit 1
fi

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Get encryption password
echo -n "Enter encryption password: "
read -s ENCRYPTION_PASSWORD
echo ""
echo -n "Confirm password: "
read -s CONFIRM_PASSWORD
echo ""

if [ "$ENCRYPTION_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    log_error "Passwords do not match!"
    exit 1
fi

# Export secrets
log_info "Exporting secrets..."

TEMP_FILE=$(mktemp)
trap "rm -f ${TEMP_FILE}" EXIT

echo "# Docker Secrets Export - ${TIMESTAMP}" > "${TEMP_FILE}"
echo "# WARNING: This file contains sensitive data!" >> "${TEMP_FILE}"
echo "" >> "${TEMP_FILE}"

for SECRET in $(docker secret ls --format "{{.Name}}" 2>/dev/null); do
    # Note: Docker doesn't allow reading secret values directly
    # This exports the metadata only
    echo "# Secret: ${SECRET}" >> "${TEMP_FILE}"
    docker secret inspect "${SECRET}" --format '{{json .}}' >> "${TEMP_FILE}"
    echo "" >> "${TEMP_FILE}"
done

# Encrypt the file
log_info "Encrypting backup..."
echo "$ENCRYPTION_PASSWORD" | gpg --batch --yes --passphrase-fd 0 -c -o "${BACKUP_FILE}" "${TEMP_FILE}"

# Set restrictive permissions
chmod 600 "${BACKUP_FILE}"

echo ""
echo "================================================="
echo "  Export Complete!"
echo "================================================="
echo ""
echo "  📦 Backup file: ${BACKUP_FILE}"
echo ""
log_warn "NOTE: Docker secrets values cannot be exported directly."
log_warn "This backup contains metadata only. Actual secret values"
log_warn "should be stored in a secure vault (e.g., HashiCorp Vault,"
log_warn "AWS Secrets Manager, or encrypted password manager)."
echo ""
log_info "To decrypt: gpg -d ${BACKUP_FILE}"
echo ""
