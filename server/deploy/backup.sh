#!/bin/sh
# Daily SQLite backup, keeps 7 days. Cron: 0 3 * * * /opt/taklifnoma/server/deploy/backup.sh
set -eu

DB=/opt/taklifnoma/server/taklifnoma.db
DEST=/var/backups/taklifnoma
KEEP_DAYS=7

mkdir -p "$DEST"
sqlite3 "$DB" ".backup '$DEST/taklifnoma-$(date +%F).db'"
find "$DEST" -name 'taklifnoma-*.db' -mtime +"$KEEP_DAYS" -delete
