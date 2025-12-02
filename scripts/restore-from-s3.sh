#!/bin/bash
# =====================================================
# Restore from AWS S3
# =====================================================

set -e

# Configuration
S3_BUCKET="${S3_BUCKET:-your-backup-bucket}"
S3_PREFIX="${S3_PREFIX:-social-publisher/backups}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI not found. Install with: pip install awscli"
    exit 1
fi

# List available backups
echo "================================================="
echo "  Available Backups in S3"
echo "================================================="
echo ""

aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --human-readable

echo ""

# Get backup file name
if [ -z "$1" ]; then
    read -p "Enter backup filename to restore (or 'latest'): " BACKUP_NAME
else
    BACKUP_NAME="$1"
fi

# Handle 'latest' option
if [ "${BACKUP_NAME}" = "latest" ]; then
    BACKUP_NAME=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | sort | tail -1 | awk '{print $4}')
    log_info "Latest backup: ${BACKUP_NAME}"
fi

if [ -z "${BACKUP_NAME}" ]; then
    log_error "No backup specified"
    exit 1
fi

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Download from S3
log_info "Downloading from S3..."
aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}" "${BACKUP_DIR}/${BACKUP_NAME}"

if [ ! -f "${BACKUP_DIR}/${BACKUP_NAME}" ]; then
    log_error "Download failed!"
    exit 1
fi

log_info "Download complete: ${BACKUP_DIR}/${BACKUP_NAME}"

# Confirm restore
echo ""
log_warn "⚠️  This will restore: ${BACKUP_NAME}"
read -p "Proceed with restore? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Run restore
./scripts/restore.sh "${BACKUP_DIR}/${BACKUP_NAME}" --no-confirm

echo ""
echo "================================================="
echo "  S3 Restore Complete!"
echo "================================================="
