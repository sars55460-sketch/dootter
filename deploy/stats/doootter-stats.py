#!/usr/bin/env python3
"""Visitor and conversion counter for converter-dotter.ru.

The site is a static Next.js export and the actual document conversion runs in
the browser, so nginx alone cannot know how many conversions succeeded. This
service is the missing piece: the page reports visits and successful
conversions here, and the site reads the totals back for display.

Design constraints that shaped this file:

* Python standard library only. The VPS has no pip packages installed for a
  system service and adding a virtualenv would make deployment fragile.
* Bound to 127.0.0.1. Nothing is exposed directly; nginx is the only way in.
* State is a single JSON file written atomically. A crash mid-write must not
  be able to truncate the counters.
* No raw IP addresses are ever stored. Visitors are de-duplicated with a daily
  rotating salted hash, kept for two days, purely so one browser does not get
  counted on every page view.
* Failures are swallowed. A broken counter must never break a conversion.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import secrets
import signal
import socketserver
import sys
import threading
from datetime import date, datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler

# ---------------------------------------------------------------------------
# configuration
# ---------------------------------------------------------------------------

DEFAULT_STATE = "/var/lib/doootter/stats.json"
DEFAULT_PORT = 8099
DEFAULT_ALLOWED_ORIGIN = "https://converter-dotter.ru"

MAX_BODY_BYTES = 4096
REQUESTS_PER_MINUTE = 30
SEEN_RETENTION_DAYS = 2

# Requests arrive through nginx, which is the only client that can reach us.
# Anything without an Origin header is a direct call from the server itself
# (health checks, tests) and is allowed; a browser always sends Origin on a
# cross-origin POST, and for same-origin fetches Chrome and Firefox send it too.
# So: an Origin that is present must match, otherwise the request is refused.
_ALLOWED_ORIGINS = {"https://converter-dotter.ru", "http://converter-dotter.ru"}

_TOOL_RE = re.compile(r"^[a-z0-9-]{1,64}$")
_LOCALE_RE = re.compile(r"^[a-z]{2}(-[a-z0-9]{2,8})?$")

_lock = threading.Lock()


# ---------------------------------------------------------------------------
# state
# ---------------------------------------------------------------------------


class State:
    """Counters plus the short-lived de-duplication table.

    All mutation goes through a single lock so concurrent requests cannot
    interleave a read-modify-write and lose an increment.
    """

    def __init__(self, path: str) -> None:
        self.path = path
        self.data = {
            "visitors": 0,
            "conversions": 0,
            "tools": {},
            "daily": {},
            "seen": {},
            "salt": "",
            "salt_date": "",
        }
        self._load()

    # -- persistence ------------------------------------------------------

    def _load(self) -> None:
        try:
            with open(self.path, "r", encoding="utf-8") as handle:
                stored = json.load(handle)
        except FileNotFoundError:
            return
        except (json.JSONDecodeError, OSError) as exc:
            # A corrupt state file must not stop the service. Counts reset to
            # zero rather than the service failing to boot; the alternative is
            # a counter that is offline until someone notices and deletes it.
            sys.stderr.write("stats: unreadable state file (%s), starting fresh\n" % exc)
            return

        if not isinstance(stored, dict):
            return
        for key in ("visitors", "conversions"):
            value = stored.get(key)
            if isinstance(value, int) and value >= 0:
                self.data[key] = value
        for key in ("tools", "daily", "seen"):
            value = stored.get(key)
            if isinstance(value, dict):
                self.data[key] = value
        for key in ("salt", "salt_date"):
            value = stored.get(key)
            if isinstance(value, str):
                self.data[key] = value

    def _save(self) -> None:
        """Write via a temporary file and rename, so readers never see a
        half-written document and a crash cannot corrupt the counters."""
        directory = os.path.dirname(self.path) or "."
        os.makedirs(directory, exist_ok=True)
        temp_path = "%s.tmp.%d" % (self.path, os.getpid())
        payload = json.dumps(self.data, separators=(",", ":"), sort_keys=True)
        try:
            with open(temp_path, "w", encoding="utf-8") as handle:
                handle.write(payload)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_path, self.path)
        except OSError as exc:
            sys.stderr.write("stats: could not persist state (%s)\n" % exc)
            try:
                os.unlink(temp_path)
            except OSError:
                pass

    # -- helpers ----------------------------------------------------------

    @staticmethod
    def _today() -> str:
        return date.today().isoformat()

    def _prune(self, today: str) -> None:
        """Drop de-duplication entries and day buckets we no longer need.

        De-duplication is per day, so anything older than SEEN_RETENTION_DAYS is
        dead weight. Day counters are kept for a month purely so the number can
        be sanity-checked; nothing reads them yet.
        """
        cutoff = (
            datetime.now(timezone.utc).date() - timedelta(days=SEEN_RETENTION_DAYS)
        ).isoformat()
        self.data["seen"] = {
            key: value for key, value in self.data["seen"].items() if value >= cutoff
        }

        month_cutoff = (
            datetime.now(timezone.utc).date() - timedelta(days=31)
        ).isoformat()
        self.data["daily"] = {
            key: value for key, value in self.data["daily"].items() if key >= month_cutoff
        }

        # Rotate the salt at the local date boundary. That makes hashes
        # incomparable across days, which is the point: the raw IP cannot be
        # recovered by rainbow-tabling a hash of a known address.
        if self.data["salt_date"] != today or not self.data["salt"]:
            self.data["salt"] = secrets.token_hex(16)
            self.data["salt_date"] = today
            self.data["seen"] = {}

    def visitor_hash(self, ip: str, user_agent: str) -> str:
        raw = "%s|%s|%s" % (self.data["salt"], ip, user_agent)
        return hashlib.sha256(raw.encode("utf-8", "replace")).hexdigest()

    def bump_daily(self, today: str) -> None:
        current = self.data["daily"].get(today)
        if not isinstance(current, int):
            current = 0
        self.data["daily"][today] = current + 1

    # -- operations -------------------------------------------------------

    def count_visit(self, ip: str, user_agent: str) -> int:
        today = self._today()
        with _lock:
            self._prune(today)
            key = self.visitor_hash(ip, user_agent)
            already = self.data["seen"].get(key)
            self.data["seen"][key] = today
            if already == today:
                # Same browser, same day: refresh the timestamp only. This is
                # a de-duplication write, not a new visitor, so no counter and
                # no save.
                return self.data["visitors"]
            self.data["visitors"] += 1
            self.bump_daily(today)
            self._save()
            return self.data["visitors"]

    def count_conversion(self, tool: str | None) -> int:
        with _lock:
            self._prune(self._today())
            self.data["conversions"] += 1
            if tool:
                self.data["tools"][tool] = self.data["tools"].get(tool, 0) + 1
            self._save()
            return self.data["conversions"]

    def public_totals(self) -> dict:
        with _lock:
            return {
                "visitors": self.data["visitors"],
                "conversions": self.data["conversions"],
            }

    def seed(self, visitors: int, conversions: int) -> None:
        """Set the starting totals, used once from the existing access log."""
        with _lock:
            self.data["visitors"] = max(int(visitors), 0)
            self.data["conversions"] = max(int(conversions), 0)
            self._prune(self._today())
            self._save()


# ---------------------------------------------------------------------------
# rate limiting
# ---------------------------------------------------------------------------


class RateLimiter:
    """Fixed-window counter, keyed by client IP.

    Deliberately not sliding-window and deliberately allowed to over-count at
    the boundary: the goal is to stop a script from inflating the totals, not
    to bill anyone.
    """

    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = datetime.now(timezone.utc).timestamp()
        with self._lock:
            bucket = self._hits.setdefault(key, [])
            cutoff = now - self.window
            self._hits[key] = [stamp for stamp in bucket if stamp >= cutoff]
            if len(self._hits[key]) >= self.limit:
                return False
            self._hits[key].append(now)
            if len(self._hits) > 4096:
                # Bound memory if someone sprays unique source addresses.
                for stale in [k for k, v in self._hits.items() if not v or v[-1] < cutoff]:
                    del self._hits[stale]
            return True


# ---------------------------------------------------------------------------
# HTTP layer
# ---------------------------------------------------------------------------


class StatsHandler(BaseHTTPRequestHandler):
    server_version = "doootter-stats"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    # populated by make_server
    state: State
    limiter: RateLimiter
    allowed_origin: str

    # -- plumbing ---------------------------------------------------------

    def log_message(self, fmt: str, *args) -> None:  # noqa: A002 - base class name
        # The access log is already handled by nginx. Silence the default
        # stderr spew so the service does not double-log every request.
        return

    def _client_ip(self) -> str:
        # nginx overwrites this header with $remote_addr, so the first value is
        # the real client and a client-supplied chain cannot be prepended to it.
        # The socket peer is the fallback for direct calls.
        forwarded = self.headers.get("X-Forwarded-For")
        if forwarded:
            first = forwarded.split(",")[0].strip()
            if first:
                return first
        peer = self.client_address[0] if self.client_address else "unknown"
        return peer

    def _origin_allowed(self) -> bool:
        origin = self.headers.get("Origin")
        if not origin:
            # Same-origin navigations and non-browser clients may omit it.
            return True
        if origin in _ALLOWED_ORIGINS or origin == self.allowed_origin:
            return True
        return False

    def _cross_site(self) -> bool:
        # The browser sends this on every fetch and no script can forge it, so it
        # catches a cross-site request even when Origin is missing, which happens
        # for some no-cors requests. Only "cross-site" is treated as hostile:
        # "same-site" covers a subdomain of ours.
        return self.headers.get("Sec-Fetch-Site") == "cross-site"

    def _send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        # The numbers change on every request; caching them would only show
        # stale totals to visitors.
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _read_json_body(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0

        if length <= 0:
            return {}

        # Drain the socket even when the body is too large or unparseable.
        # Whatever we do next, these bytes must not be left for the next
        # request on this keep-alive connection.
        if length > MAX_BODY_BYTES:
            self._drain(length)
            return {}

        try:
            raw = self.rfile.read(length)
        except OSError:
            return {}

        try:
            parsed = json.loads(raw.decode("utf-8", "replace"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return {}
        return parsed if isinstance(parsed, dict) else {}

    def _drain(self, length: int) -> None:
        remaining = length
        while remaining > 0:
            chunk = self.rfile.read(min(remaining, 65536))
            if not chunk:
                return
            remaining -= len(chunk)

    def _guard(self) -> bool:
        """Shared pre-flight for the write endpoints."""
        if not self._origin_allowed() or self._cross_site():
            self._send_json({"error": "forbidden"}, status=403)
            return False
        if not self.limiter.allow(self._client_ip()):
            self._send_json({"error": "rate limited"}, status=429)
            return False
        return True

    # -- routes -----------------------------------------------------------

    def do_GET(self) -> None:  # noqa: N802 - base class name
        path = self.path.split("?", 1)[0]
        if path in ("/api/stats", "/health"):
            self._send_json(self.state.public_totals())
            return
        self._send_json({"error": "not found"}, status=404)

    def do_POST(self) -> None:  # noqa: N802 - base class name
        path = self.path.split("?", 1)[0]

        # The body has to be read before anything else, including on the
        # rejection paths. With HTTP/1.1 keep-alive, bytes left unread in the
        # socket are parsed as the start of the next request line, which turns
        # the following request on the same connection into a bogus 501.
        body = self._read_json_body()

        if not self._guard():
            return

        if path == "/api/stats/visit":
            # Recognised for future breakdowns, ignored today. Validating here
            # keeps a malformed client from growing the state file.
            if isinstance(body.get("locale"), str) and not _LOCALE_RE.match(body["locale"]):
                body.pop("locale", None)
            if isinstance(body.get("path"), str):
                body.pop("path", None)
            visitors = self.state.count_visit(self._client_ip(), self.headers.get("User-Agent", ""))
            self._send_json({"visitors": visitors})
            return

        if path == "/api/stats/conversion":
            tool = body.get("tool")
            if not isinstance(tool, str) or not _TOOL_RE.match(tool):
                tool = None
            conversions = self.state.count_conversion(tool)
            self._send_json({"conversions": conversions})
            return

        self._send_json({"error": "not found"}, status=404)


class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True


def make_server(host: str, port: int, state_path: str, origin: str, limit: int) -> ThreadedHTTPServer:
    state = State(state_path)
    handler = type(
        "BoundStatsHandler",
        (StatsHandler,),
        {
            "state": state,
            "limiter": RateLimiter(limit),
            "allowed_origin": origin,
        },
    )
    return ThreadedHTTPServer((host, port), handler)


# ---------------------------------------------------------------------------
# entry point
# ---------------------------------------------------------------------------


def seed_from_log(log_path: str, state_path: str) -> int:
    """Seed the visitor total from an existing nginx access log.

    Counts unique real browsers per day: requests that returned 200 for a
    document path, skipping command-line clients, headless browsers and the
    scanners that hit every new domain. This is a floor, not a census: the log
    only covers part of the site's life, so the resulting number means "at
    least this many".
    """
    import collections

    # Lower-cased on purpose: the comparison is made against a lower-cased agent,
    # so a mixed-case entry such as "HeadlessChrome" would never match and every
    # headless scanner would be counted as a visitor.
    skip_agent = ("curl/", "wget/", "headlesschrome", "leakix", "iisec", "python-requests", "bot", "spider")
    # Any document under a locale prefix counts, not just the locale root, so
    # the converter pages are included in the baseline.
    locales = ("ru", "en", "de", "es", "fr")
    is_document = lambda target: (
        target == "/" or (target.count("/") >= 2 and target.split("/")[1] in locales)
    )

    per_day = collections.defaultdict(set)
    try:
        handle = open(log_path, "r", encoding="utf-8", errors="replace")
    except OSError as exc:
        sys.stderr.write("seed: cannot read %s (%s)\n" % (log_path, exc))
        return 1

    with handle:
        for line in handle:
            parts = line.split('"')
            if len(parts) < 6:
                continue
            ip = parts[0].split()[0] if parts[0].split() else ""
            request = parts[1].split()
            status = parts[2].split()
            # nginx "combined" splits into seven fields here: request line (1),
            # referer (3) and user agent (5).
            agent = parts[5].strip() if len(parts) > 5 else ""
            if not ip or ip.startswith("127.") or len(request) < 2 or len(status) < 1:
                continue
            if not status[0].isdigit() or status[0] != "200":
                continue
            lowered = agent.lower()
            if any(bad in lowered for bad in skip_agent):
                continue
            target = request[1]
            if "/_next/" in target or target.startswith("/fonts/") or target.startswith("/api/"):
                continue
            if not is_document(target):
                continue
            match = re.search(r"\[(\d{2}/\w{3}/\d{4})", line)
            stamp = match.group(1) if match else "unknown"
            per_day[stamp].add((ip, agent))

    total = sum(len(v) for v in per_day.values())
    State(state_path).seed(total, 0)
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--state", default=DEFAULT_STATE)
    parser.add_argument("--origin", default=DEFAULT_ALLOWED_ORIGIN)
    parser.add_argument("--limit", type=int, default=REQUESTS_PER_MINUTE)
    parser.add_argument("--seed-from-log", metavar="PATH")
    args = parser.parse_args(argv)

    if args.seed_from_log:
        return seed_from_log(args.seed_from_log, args.state)

    httpd = make_server(args.host, args.port, args.state, args.origin, args.limit)

    def shutdown(_signum, _frame):
        threading.Thread(target=httpd.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    sys.stderr.write(
        "stats: listening on %s:%d, state %s\n" % (args.host, args.port, args.state)
    )
    try:
        httpd.serve_forever()
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))