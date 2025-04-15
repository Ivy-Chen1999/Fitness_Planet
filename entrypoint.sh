#!/bin/sh
DB_FILE="/data/app.db"
BACKUP_FILE="/app/src/app.db.bak"
cd /app
export FLASK_APP=src/run.py
mkdir -p /data

if [ ! -f "$DB_FILE" ]; then
  echo "Initializing database from backup..."
  cp "$BACKUP_FILE" "$DB_FILE"
else
  echo "Existing database found, skipping initialization."
fi


exec flask run --host=0.0.0.0 --port=8080