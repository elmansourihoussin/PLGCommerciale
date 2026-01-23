#!/bin/sh
set -e

API_BASE_URL=${API_BASE_URL:-/api}
mkdir -p /usr/share/nginx/html/assets

cat > /usr/share/nginx/html/assets/app-config.json <<CONFIG
{
  "apiBaseUrl": "${API_BASE_URL}"
}
CONFIG

exec "$@"
