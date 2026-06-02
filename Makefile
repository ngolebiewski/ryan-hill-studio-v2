include .env
export

backup-db:
	@mkdir -p backups
	@TIMESTAMP=$$(date +"%Y-%m-%d_%H-%M-%S"); \
	echo "Backing up DB... $$TIMESTAMP"; \
	pg_dump -Fc "$$NEON_DATABASE_URL" -f "backups/backup_$$TIMESTAMP.dump"; \
	echo "Saved to backups/backup_$$TIMESTAMP.dump"

dump: backup-db

# See contents of data dump: pg_restore -l backups/backup_2026-06-02_14-32-17.dump 
# Read the backup as SQL: pg_restore -f backups/backup.sql backups/backup_2026-06-02_14-32-17.dump
