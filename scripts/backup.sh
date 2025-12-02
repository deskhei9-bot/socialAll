#!/bin/bash
# =====================================================
# Backup Script for Social Publisher
# Backs up PostgreSQL database and storage volumes
# =====================================================

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Database configuration
DB_CONTAINER="${DB_CONTAINER:-social-publisher-db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Create backup directory
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"

echo "================================================="
echo "  Social Publisher Backup"
echo "  Timestamp: ${TIMESTAMP}"
echo "================================================="
echo ""

# =====================================================
# 1. Database Backup
# =====================================================
log_info "Starting database backup..."

DB_BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}/database.sql.gz"

if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} ${DB_NAME} | gzip > "${DB_BACKUP_FILE}"
    
    if [ -f "${DB_BACKUP_FILE}" ]; then
        DB_SIZE=$(du -h "${DB_BACKUP_FILE}" | cut -f1)
        log_info "Database backup completed: ${DB_BACKUP_FILE} (${DB_SIZE})"
    else
        log_error "Database backup failed!"
        exit 1
    fi
else
    log_warn "Database container '${DB_CONTAINER}' not running. Skipping database backup."
fi

# =====================================================
# 2. Storage Volume Backup
# =====================================================
log_info "Starting storage volume backup..."

STORAGE_BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}/storage.tar.gz"

# Check if storage volume exists
if docker volume ls --format '{{.Name}}' | grep -q "storage-data"; then
    docker run --rm \
        -v storage-data:/data:ro \
        -v "$(pwd)/${BACKUP_DIR}/${BACKUP_NAME}":/backup \
        alpine tar czf /backup/storage.tar.gz -C /data .
    
    if [ -f "${STORAGE_BACKUP_FILE}" ]; then
        STORAGE_SIZE=$(du -h "${STORAGE_BACKUP_FILE}" | cut -f1)
        log_info "Storage backup completed: ${STORAGE_BACKUP_FILE} (${STORAGE_SIZE})"
    else
        log_error "Storage backup failed!"
        exit 1
    fi
else
    log_warn "Storage volume 'storage-data' not found. Skipping storage backup."
fi

# =====================================================
# 3. Configuration Backup
# =====================================================
log_info "Backing up configuration files..."

CONFIG_BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}/config.tar.gz"

tar czf "${CONFIG_BACKUP_FILE}" \
    --exclude='.env' \
    --exclude='node_modules' \
    --exclude='backups' \
    .env.example \
    .env.complete.example \
    docker-compose*.yml \
    nginx/ \
    volumes/api/kong.yml \
    2>/dev/null || true

if [ -f "${CONFIG_BACKUP_FILE}" ]; then
    CONFIG_SIZE=$(du -h "${CONFIG_BACKUP_FILE}" | cut -f1)
    log_info "Configuration backup completed: ${CONFIG_BACKUP_FILE} (${CONFIG_SIZE})"
fi

# =====================================================
# 4. Create backup manifest
# =====================================================
log_info "Creating backup manifest..."

cat > "${BACKUP_DIR}/${BACKUP_NAME}/manifest.json" << EOF
{
    "backup_name": "${BACKUP_NAME}",
    "timestamp": "${TIMESTAMP}",
    "created_at": "$(date -Iseconds)",
    "components": {
        "database": $([ -f "${DB_BACKUP_FILE}" ] && echo "true" || echo "false"),
        "storage": $([ -f "${STORAGE_BACKUP_FILE}" ] && echo "true" || echo "false"),
        "config": $([ -f "${CONFIG_BACKUP_FILE}" ] && echo "true" || echo "false")
    },
    "sizes": {
        "database": "$([ -f "${DB_BACKUP_FILE}" ] && du -h "${DB_BACKUP_FILE}" | cut -f1 || echo "N/A")",
        "storage": "$([ -f "${STORAGE_BACKUP_FILE}" ] && du -h "${STORAGE_BACKUP_FILE}" | cut -f1 || echo "N/A")",
        "config": "$([ -f "${CONFIG_BACKUP_FILE}" ] && du -h "${CONFIG_BACKUP_FILE}" | cut -f1 || echo "N/A")"
    }
}
EOF

# =====================================================
# 5. Create compressed archive
# =====================================================
log_info "Creating final backup archive..."

cd "${BACKUP_DIR}"
tar czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"
cd - > /dev/null

FINAL_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)

# =====================================================
# 6. Cleanup old backups
# =====================================================
log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

find "${BACKUP_DIR}" -name "backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | wc -l)

# =====================================================
# Summary
# =====================================================
echo ""
echo "================================================="
echo "  Backup Complete!"
echo "================================================="
echo ""
echo "  📦 Backup File: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo "  📊 Total Size: ${FINAL_SIZE}"
echo "  🗂️  Total Backups: ${BACKUP_COUNT}"
echo ""
echo "  To restore, run:"
echo "  ./scripts/restore.sh ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
echo ""
