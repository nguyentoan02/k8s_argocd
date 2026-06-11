#!/usr/bin/env bash
set -euo pipefail

PROFILE="${MINIKUBE_PROFILE:-w9}"
API_IMAGE="${API_IMAGE:-w9-demo-api:1}"
WEB_IMAGE="${WEB_IMAGE:-w9-demo-web:1}"

cd /d/Gitops_W9

echo "Building $API_IMAGE"
docker build -t "$API_IMAGE" ./app/api

echo "Building $WEB_IMAGE"
docker build -t "$WEB_IMAGE" ./app/web

echo "Loading images into minikube profile: $PROFILE"
minikube image load "$API_IMAGE" -p "$PROFILE"
minikube image load "$WEB_IMAGE" -p "$PROFILE"

echo "Done."
