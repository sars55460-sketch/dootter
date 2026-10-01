#!/usr/bin/env bash
#
# Installs the visitor and conversion counter service on the VPS.
#
#   bash install-stats.sh
#   bash install-stats.sh --seed-from-log /var/log/nginx/doootter.access.log
#
# Safe to re-run. The counters live in /var/lib/doootter/stats.json and are
# never reset unless --seed-from-log is passed with no existing state, so a plain
# re-run just refreshes the code and restarts the service.

set -euo pipefail

UNIT_NAME="doootter-stats.service"
INSTALL_DIR="/opt/doootter-stats"
STATE_DIR="/var/lib/doootter"
STATE_FILE="${STATE_DIR}/stats.json"
SEED_LOG=""

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

while [ $# -gt 0 ]; do
    case "$1" in
        --seed-from-log) SEED_LOG="${2:-}"; shift 2 ;;
        -h|--help)       sed -n '2,9p' "$0"; exit 0 ;;
        *)               die "unknown argument: $1" ;;
    esac
done

[ "$(id -u)" -eq 0 ] || die "need root"

[ -f "${HERE}/doootter-stats.py" ]   || die "missing doootter-stats.py next to this script"
[ -f "${HERE}/doootter-stats.service" ] || die "missing doootter-stats.service next to this script"
command -v python3 >/dev/null 2>&1 || die "python3 is not installed"

log "installing service files into ${INSTALL_DIR}"
install -d -m 755 "$INSTALL_DIR"
install -m 644 "${HERE}/doootter-stats.py" "${INSTALL_DIR}/doootter-stats.py"
install -m 644 "${HERE}/doootter-stats.service" "/etc/systemd/system/${UNIT_NAME}"

# StateDirectory= in the unit would also create this, but the seed step runs
# before systemd starts anything and needs the directory to already exist.
install -d -m 755 -o www-data -g www-data "$STATE_DIR"

if [ -n "$SEED_LOG" ]; then
    if [ -f "$STATE_FILE" ]; then
        log "state file already exists, leaving counters untouched"
        log "delete ${STATE_FILE} first if you really want to re-seed"
    else
        [ -f "$SEED_LOG" ] || die "seed log not found: $SEED_LOG"
        log "seeding visitors from ${SEED_LOG}"
        python3 "${INSTALL_DIR}/doootter-stats.py" \
            --state "$STATE_FILE" --seed-from-log "$SEED_LOG" \
            || die "seeding failed"
        chown www-data:www-data "$STATE_FILE" 2>/dev/null || true
        log "seeded: $(cat "$STATE_FILE")"
    fi
fi

log "reloading systemd"
systemctl daemon-reload
systemctl enable "$UNIT_NAME" >/dev/null 2>&1 || true
systemctl restart "$UNIT_NAME"

sleep 2
systemctl is-active --quiet "$UNIT_NAME" || {
    systemctl --no-pager --lines 20 status "$UNIT_NAME" || true
    die "service did not come up"
}

log "service is up"
cat <<EOF

  systemctl status ${UNIT_NAME}
  journalctl -u ${UNIT_NAME} -n 50
  curl -s http://127.0.0.1:8099/api/stats

EOF