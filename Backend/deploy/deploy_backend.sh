#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/azureuser/Scopio-WebApp/Backend"
VENV_PYTHON="/home/azureuser/Scopio-WebApp/benv/bin/python"

echo "[1/8] Switching to app directory"
cd "$APP_DIR"

echo "[2/8] Pulling latest main branch"
git fetch --all --prune
git checkout main
git pull --ff-only origin main

echo "[3/8] Installing/updating dependencies"
"$VENV_PYTHON" -m pip install --upgrade pip
"$VENV_PYTHON" -m pip install -r requirements.txt

echo "[4/8] Running database migrations"
"$VENV_PYTHON" manage.py migrate --noinput

echo "[5/8] Collecting static files"
"$VENV_PYTHON" manage.py collectstatic --noinput

echo "[6/8] Running Django system checks"
"$VENV_PYTHON" manage.py check --deploy

echo "[7/8] Restarting services"
sudo systemctl restart gunicorn
sudo systemctl reload nginx

echo "[8/8] Health checks"
curl -fsS https://20.17.98.254.nip.io/api/ >/dev/null
curl -fsS https://20.17.98.254.nip.io/api/auth/status/ >/dev/null || true

echo "Deployment completed successfully"
