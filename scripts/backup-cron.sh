#!/bin/bash
# =====================================================
# Automated Backup Script for Cron
# Add to crontab: 0 2 * * * /path/to/backup-cron.sh
# =====================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
LOG_FILE="${PROJECT_DIR}/backups/backup.log"
BACKUP_DIR="${PROJECT_DIR}/backups"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Log function
log() {
    echo "[$(date -Iseconds)] $1" >> "${LOG_FILE}"
}

log "Starting automated backup..."

cd "${PROJECT_DIR}"

# Run backup
if ./scripts/backup.sh >> "${LOG_FILE}" 2>&1; then
    log "Backup completed successfully"
    
    # Optional: Upload to remote storage
    # Uncomment and configure as needed
    
    # AWS S3
    # aws s3 cp "${BACKUP_DIR}"/backup_*.tar.gz s3://your-bucket/backups/
    
    # Google Cloud Storage
    # gsutil cp "${BACKUP_DIR}"/backup_*.tar.gz gs://your-bucket/backups/
    
    # Backblaze B2
    # b2 upload-file your-bucket "${BACKUP_DIR}"/backup_*.tar.gz backups/
    
    # SFTP/SCP
    # scp "${BACKUP_DIR}"/backup_*.tar.gz user@remote:/path/to/backups/
    
else
    log "Backup failed!"
    
    # Optional: Send alert notification
    # curl -X POST "https://your-webhook-url" \
    #     -H "Content-Type: application/json" \
    #     -d '{"text": "Social Publisher backup failed!"}'
    
    exit 1
fi

# Rotate log file (keep last 1000 lines)
if [ -f "${LOG_FILE}" ]; then
    tail -n 1000 "${LOG_FILE}" > "${LOG_FILE}.tmp"
    mv "${LOG_FILE}.tmp" "${LOG_FILE}"
fi

log "Automated backup process finished"
