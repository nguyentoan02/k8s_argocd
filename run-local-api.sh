#!/usr/bin/env bash
set -euo pipefail

cd /d/Gitops_W9/app/api

if [ ! -d ".venv" ]; then
  python -m venv .venv
fi

source .venv/Scripts/activate
export PYTHONDONTWRITEBYTECODE=1

python -m pip install -r requirements.txt

export APP_NAME="${APP_NAME:-demo-api}"
export VERSION="${VERSION:-v1}"
export ERROR_RATE="${ERROR_RATE:-0}"
export RESPONSE_DELAY_MS="${RESPONSE_DELAY_MS:-0}"
export PORT="${PORT:-5001}"

echo "Starting backend at http://localhost:$PORT"
echo "VERSION=$VERSION ERROR_RATE=$ERROR_RATE RESPONSE_DELAY_MS=$RESPONSE_DELAY_MS PORT=$PORT"

python app.py
