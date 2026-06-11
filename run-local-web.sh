#!/usr/bin/env bash
set -euo pipefail

cd /d/Gitops_W9/app/web

export PORT="${PORT:-8090}"
export API_HOST="${API_HOST:-127.0.0.1}"
export API_PORT="${API_PORT:-5001}"

echo "Starting frontend at http://localhost:$PORT"
echo "Proxying /api/* to http://$API_HOST:$API_PORT"

node server.mjs
