#!/bin/bash
# =====================================================
# Backup to AWS S3
# Requires AWS CLI configured with credentials
# =====================================================

set -e

# Configuration
S3_BUCKET="${S3_BUCKET:-your-backup-bucket}"
S3_PREFIX="${S3_PREFIX:-social-publisher/backups}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    log_error "AWS CLI not found. Install with: pip install awscli"
    exit 1
fi

# Create local backup first
log_info "Creating local backup..."
./scripts/backup.sh

# Find latest backup
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/backup_*.tar.gz 2>/dev/null | head -1)

if [ -z "${LATEST_BACKUP}" ]; then
    log_error "No backup file found!"
    exit 1
fi

BACKUP_FILENAME=$(basename "${LATEST_BACKUP}")

# Upload to S3
log_info "Uploading to S3: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILENAME}"

aws s3 cp "${LATEST_BACKUP}" "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILENAME}" \
    --storage-class STANDARD_IA

log_info "Upload complete!"

# List recent backups in S3
log_info "Recent backups in S3:"
aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --human-readable | tail -5

# Optional: Clean up old S3 backups (keep last 30 days)
# aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
#     createDate=$(echo $line | awk '{print $1" "$2}')
#     createDate=$(date -d "$createDate" +%s)
#     olderThan=$(date -d "30 days ago" +%s)
#     if [[ $createDate -lt $olderThan ]]; then
#         fileName=$(echo $line | awk '{print $4}')
#         aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/$fileName"
#     fi
# done

echo ""
echo "================================================="
echo "  S3 Backup Complete!"
echo "================================================="
echo "  📦 File: ${BACKUP_FILENAME}"
echo "  ☁️  Location: s3://${S3_BUCKET}/${S3_PREFIX}/"
echo ""
