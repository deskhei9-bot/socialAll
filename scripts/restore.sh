#!/bin/bash
# =====================================================
# Restore Script for Social Publisher
# Restores PostgreSQL database and storage volumes
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# Check arguments
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.tar.gz> [--database-only|--storage-only|--config-only]"
    echo ""
    echo "Options:"
    echo "  --database-only   Restore only the database"
    echo "  --storage-only    Restore only the storage volume"
    echo "  --config-only     Restore only configuration files"
    echo "  --no-confirm      Skip confirmation prompts"
    echo ""
    echo "Examples:"
    echo "  $0 backups/backup_20240115_120000.tar.gz"
    echo "  $0 backups/backup_20240115_120000.tar.gz --database-only"
    exit 1
fi

BACKUP_FILE="$1"
RESTORE_DB=true
RESTORE_STORAGE=true
RESTORE_CONFIG=true
NO_CONFIRM=false

# Parse additional arguments
shift
while [ "$#" -gt 0 ]; do
    case "$1" in
        --database-only)
            RESTORE_STORAGE=false
            RESTORE_CONFIG=false
            ;;
        --storage-only)
            RESTORE_DB=false
            RESTORE_CONFIG=false
            ;;
        --config-only)
            RESTORE_DB=false
            RESTORE_STORAGE=false
            ;;
        --no-confirm)
            NO_CONFIRM=true
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
    shift
done

# Database configuration
DB_CONTAINER="${DB_CONTAINER:-social-publisher-db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"

# Validate backup file
if [ ! -f "${BACKUP_FILE}" ]; then
    log_error "Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "================================================="
echo "  Social Publisher Restore"
echo "================================================="
echo ""
echo "  📦 Backup File: ${BACKUP_FILE}"
echo "  🗄️  Restore Database: ${RESTORE_DB}"
echo "  📁 Restore Storage: ${RESTORE_STORAGE}"
echo "  ⚙️  Restore Config: ${RESTORE_CONFIG}"
echo ""

# Confirmation
if [ "${NO_CONFIRM}" = false ]; then
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite existing data!${NC}"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "${CONFIRM}" != "yes" ]; then
        echo "Restore cancelled."
        exit 0
    fi
fi

# Create temporary directory for extraction
TEMP_DIR=$(mktemp -d)
trap "rm -rf ${TEMP_DIR}" EXIT

log_info "Extracting backup archive..."
tar xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"

# Find the backup directory
BACKUP_DIR=$(ls -d ${TEMP_DIR}/backup_* 2>/dev/null | head -1)
if [ -z "${BACKUP_DIR}" ]; then
    log_error "Invalid backup archive structure"
    exit 1
fi

# Display manifest if exists
if [ -f "${BACKUP_DIR}/manifest.json" ]; then
    log_info "Backup manifest:"
    cat "${BACKUP_DIR}/manifest.json"
    echo ""
fi

# =====================================================
# 1. Restore Database
# =====================================================
if [ "${RESTORE_DB}" = true ] && [ -f "${BACKUP_DIR}/database.sql.gz" ]; then
    log_step "Restoring database..."
    
    if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
        log_error "Database container '${DB_CONTAINER}' is not running!"
        log_info "Start the database first: docker-compose up -d db"
        exit 1
    fi
    
    # Drop existing connections and recreate database
    log_info "Preparing database..."
    docker exec ${DB_CONTAINER} psql -U ${DB_USER} -c "
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();
    " 2>/dev/null || true
    
    # Restore database
    log_info "Importing database dump..."
    gunzip -c "${BACKUP_DIR}/database.sql.gz" | docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} ${DB_NAME}
    
    log_info "Database restored successfully!"
else
    if [ "${RESTORE_DB}" = true ]; then
        log_warn "No database backup found in archive"
    fi
fi

# =====================================================
# 2. Restore Storage Volume
# =====================================================
if [ "${RESTORE_STORAGE}" = true ] && [ -f "${BACKUP_DIR}/storage.tar.gz" ]; then
    log_step "Restoring storage volume..."
    
    # Check if volume exists, create if not
    if ! docker volume ls --format '{{.Name}}' | grep -q "storage-data"; then
        log_info "Creating storage volume..."
        docker volume create storage-data
    fi
    
    # Clear existing data and restore
    log_info "Restoring storage data..."
    docker run --rm \
        -v storage-data:/data \
        -v "${BACKUP_DIR}":/backup:ro \
        alpine sh -c "rm -rf /data/* && tar xzf /backup/storage.tar.gz -C /data"
    
    log_info "Storage volume restored successfully!"
else
    if [ "${RESTORE_STORAGE}" = true ]; then
        log_warn "No storage backup found in archive"
    fi
fi

# =====================================================
# 3. Restore Configuration
# =====================================================
if [ "${RESTORE_CONFIG}" = true ] && [ -f "${BACKUP_DIR}/config.tar.gz" ]; then
    log_step "Restoring configuration files..."
    
    # Create backup of current config
    CURRENT_CONFIG_BACKUP="config_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar czf "${CURRENT_CONFIG_BACKUP}" \
        docker-compose*.yml \
        nginx/ \
        volumes/api/kong.yml \
        2>/dev/null || true
    log_info "Current config backed up to: ${CURRENT_CONFIG_BACKUP}"
    
    # Restore config
    tar xzf "${BACKUP_DIR}/config.tar.gz" -C .
    
    log_info "Configuration restored successfully!"
else
    if [ "${RESTORE_CONFIG}" = true ]; then
        log_warn "No configuration backup found in archive"
    fi
fi

# =====================================================
# Summary
# =====================================================
echo ""
echo "================================================="
echo "  Restore Complete!"
echo "================================================="
echo ""
echo "  ✅ Restoration finished successfully"
echo ""
echo "  Next steps:"
echo "  1. Restart services: docker-compose restart"
echo "  2. Verify data integrity"
echo "  3. Test application functionality"
echo ""
