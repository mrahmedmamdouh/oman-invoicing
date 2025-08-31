echo "💾 Setting up comprehensive backup strategy..."

BACKUP_DIR="/var/backups/oman-invoicing"
REMOTE_BACKUP="${REMOTE_BACKUP_URL:-s3://your-backup-bucket}"

# Create backup directories
sudo mkdir -p $BACKUP_DIR/{database,files,config}

# Database backup script
cat > scripts/backup/automated-backup.sh
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/oman-invoicing"

echo "💾 Starting automated backup - $DATE"

# 1. Database backup
echo "📊 Backing up PostgreSQL..."
docker-compose exec -T postgres pg_dump -U postgres oman_invoicing | gzip > $BACKUP_DIR/database/oman_invoicing_$DATE.sql.gz

# 2. File backup
echo "📁 Backing up application files..."
tar -czf $BACKUP_DIR/files/uploads_$DATE.tar.gz backend/uploads/
tar -czf $BACKUP_DIR/files/certificates_$DATE.tar.gz certificates/

# 3. Configuration backup  
echo "⚙️ Backing up configuration..."
tar -czf $BACKUP_DIR/config/config_$DATE.tar.gz backend/.env frontend/.env nginx/ kubernetes/

# 4. Redis backup
echo "🔴 Backing up Redis..."
docker-compose exec redis redis-cli --rdb /data/dump_$DATE.rdb BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump_$DATE.rdb $BACKUP_DIR/database/

# 5. Upload to remote storage (if configured)
if [ ! -z "$REMOTE_BACKUP_URL" ]; then
    echo "☁️ Uploading to remote storage..."
    aws s3 sync $BACKUP_DIR $REMOTE_BACKUP_URL/oman-invoicing-backup/$DATE/
fi

# 6. Cleanup old backups (keep 30 days local, 90 days remote)
find $BACKUP_DIR -type f -mtime +30 -delete
if [ ! -z "$REMOTE_BACKUP_URL" ]; then
    aws s3 ls $REMOTE_BACKUP_URL/oman-invoicing-backup/ | grep DIR | awk '{print $2}' | sort | head -n -90 | xargs -I {} aws s3 rm --recursive $REMOTE_BACKUP_URL/oman-invoicing-backup/{}
fi

echo "✅ Backup completed successfully - $DATE"
