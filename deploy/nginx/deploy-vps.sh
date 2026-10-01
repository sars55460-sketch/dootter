#!/usr/bin/env bash
#
# Deploys the prebuilt static export to a Linux VPS running nginx.
#
#   bash deploy-vps.sh --src /tmp/dd/site
#   bash deploy-vps.sh --zip /tmp/dootter-site.zip
#   bash deploy-vps.sh --src /tmp/dd/site --enable-tls
#
# --enable-tls runs certbot and installs the HTTPS origin block. Run it only
# after the A record for converter-doootter.ru already points at this server
# through Cloudflare: Let's Encrypt has to reach this host to validate.
#
# Requires root or sudo. Safe to re-run: it always re-extracts the site and
# leaves a rollback copy of the previous out/ behind.

set -euo pipefail

ZIP=""
SRC=""
ENABLE_TLS=0
SITE_DIR="/var/www/doootter"
CERTBOT_DIR="/var/www/certbot"
CONF_DIR="/etc/nginx/conf.d"
SNIPPET_DIR="/etc/nginx/snippets"
SITE_CONF="${CONF_DIR}/doootter.conf"
SSL_CONF="${CONF_DIR}/doootter-ssl.conf"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORIGINAL_ARGS=("$@")

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m!!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

while [ $# -gt 0 ]; do
    case "$1" in
        --src)       SRC="${2:-}"; shift 2 ;;
        --zip)       ZIP="${2:-}"; shift 2 ;;
        --enable-tls) ENABLE_TLS=1; shift ;;
        -h|--help)   sed -n '2,14p' "$0"; exit 0 ;;
        *)           die "unknown argument: $1" ;;
    esac
done

[ -n "$SRC" ] || [ -n "$ZIP" ] || die "pass the site files with --src /path/to/site (or --zip /path/to.zip)"
[ -n "$ZIP" ] || [ -d "$SRC" ] || die "site directory not found: ${SRC:-<empty>}"
[ -z "$ZIP" ] || [ -f "$ZIP" ] || die "archive not found: $ZIP"

if [ "$(id -u)" -ne 0 ]; then
    command -v sudo >/dev/null 2>&1 || die "need root, and sudo is not installed"
    log "re-running under sudo"
    exec sudo -E bash "$0" "${ORIGINAL_ARGS[@]}"
fi

if [ -n "$ZIP" ] && ! command -v unzip >/dev/null 2>&1; then
    log "installing unzip"
    if command -v apt-get >/dev/null 2>&1; then
        apt-get update -qq && apt-get install -y -qq unzip
    elif command -v dnf >/dev/null 2>&1; then
        dnf install -y -q unzip
    else
        die "no apt-get or dnf: install unzip manually and re-run"
    fi
fi

if ! command -v nginx >/dev/null 2>&1; then
    log "installing nginx"
    if command -v apt-get >/dev/null 2>&1; then
        apt-get update -qq && apt-get install -y -qq nginx
    elif command -v dnf >/dev/null 2>&1; then
        dnf install -y -q nginx
    else
        die "no apt-get or dnf: install nginx manually and re-run"
    fi
else
    log "nginx already installed: $(nginx -v 2>&1)"
fi

# Deploy the site files.
if [ -d "$SITE_DIR" ] && [ -n "$(ls -A "$SITE_DIR" 2>/dev/null)" ]; then
    log "keeping previous site as ${SITE_DIR}.bak"
    rm -rf "${SITE_DIR}.bak"
    mv "$SITE_DIR" "${SITE_DIR}.bak"
fi
mkdir -p "$SITE_DIR"
if [ -n "$ZIP" ]; then
    log "extracting $(basename "$ZIP") into $SITE_DIR"
    unzip -q -o "$ZIP" -d "$SITE_DIR"
else
    log "copying site files from $SRC into $SITE_DIR"
    cp -a "$SRC/." "$SITE_DIR/"
fi
chown -R www-data:www-data "$SITE_DIR" 2>/dev/null || true
find "$SITE_DIR" -type d -exec chmod 755 {} +
find "$SITE_DIR" -type f -exec chmod 644 {} +
log "deployed $(find "$SITE_DIR" -type f | wc -l | tr -d ' ') files"

# nginx configuration.
mkdir -p "$SNIPPET_DIR" "$CERTBOT_DIR"
[ -f "${HERE}/security-headers.conf" ]  || die "missing security-headers.conf next to this script"
[ -f "${HERE}/doootter.conf" ]          || die "missing doootter.conf next to this script"
install -m 644 "${HERE}/security-headers.conf" "${SNIPPET_DIR}/doootter-security-headers.conf"
install -m 644 "${HERE}/doootter.conf" "$SITE_CONF"
rm -f "${CONF_DIR}/default.conf" /etc/nginx/sites-enabled/default
mkdir -p /etc/nginx/sites-enabled

log "testing nginx configuration"
nginx -t || die "nginx config is invalid, nothing was changed"

systemctl enable nginx >/dev/null 2>&1 || true
systemctl reload nginx || systemctl restart nginx
log "nginx reloaded"

# TLS, only when asked for and only when the domain already resolves here.
if [ "$ENABLE_TLS" -eq 1 ]; then
    log "requesting a Let's Encrypt certificate"
    command -v certbot >/dev/null 2>&1 || {
        apt-get install -y -qq certbot python3-certbot-nginx
    }
    certbot --nginx -d converter-doootter.ru -d www.converter-doootter.ru \
        --non-interactive --agree-tos --register-unsafely-without-email \
        --redirect || die "certbot failed: check that the domain already points at this server"
    install -m 644 "${HERE}/doootter-ssl.conf" "$SSL_CONF"
    nginx -t || die "SSL config is invalid"
    systemctl reload nginx
    log "HTTPS origin enabled"
fi

log "done. quick checks:"
cat <<EOF

  curl -I  http://127.0.0.1/en/                        # expect 200
  curl -I  http://127.0.0.1/.well-known/security.txt     # expect 200
  curl -I  http://127.0.0.1/pdf.worker.min.mjs          # expect 200 + javascript
  curl -sI http://127.0.0.1/en/ | grep -i content-type # expect text/html
  curl -sI http://127.0.0.1/en/ | grep -i content-security-policy

  After this works locally, check the same URLs through Cloudflare:
  curl -I https://converter-doootter.ru/en/

EOF