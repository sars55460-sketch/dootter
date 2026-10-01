# Live visitor count

## Goal

Show how many people are on the site right now, next to the existing totals.

The current counter answers "how many people have ever been here". It cannot
answer "is anyone here now", which is the question a visitor actually asks when
they see a number. The new figure is shown to every visitor as a bare count.

Decided with the user:

- Visible to all visitors, as a count only. No country, page, IP or anything
  else that identifies a person.
- A visitor counts as present for 5 minutes after their last ping.
- Shown on its own line, below the existing two numbers, with a green dot.
- The number is reported as-is. No rounding and no smoothing, even though a
  visitor can inflate it by scripting the ping endpoint.

## Why in memory

The obvious place for this is the existing state file. It is the wrong place.

`stats.json` is written on every counted visit, and the presence list changes
every 30 seconds for every open tab. Persisting it would mean an fsync per ping
per visitor, into a file that a public `GET` also reads. The data is worthless
after five minutes, so paying disk to keep it is a cost with no benefit.

Keeping it in memory has a property that reads like a drawback but is not one:
when the service restarts, the live count drops to zero and refills within
thirty seconds, because clients ping on load. A stale number carried across a
restart would be a lie about the present. The service is already `Restart=`-ed by
systemd and this is the first restart in production, so the honest behaviour is
the one to keep.

Counting from the nginx access log instead was rejected: it needs a cron job,
breaks when logs rotate, cannot see a tab that is simply left open, and is less
accurate than the client already telling us directly.

## Data model

A new dictionary on the `State` object, in memory only:

```
live: { <visitor hash>: <unix seconds of last ping> }
```

Entries older than `LIVE_WINDOW_SECONDS = 300` are dropped lazily, on the next
request that touches the set. A background timer is deliberately not used: it
would keep the process awake and fire when there is nothing to do. Lazy expiry
means the set is pruned at most as often as it is used, and a service nobody is
visiting prunes nothing.

The key is the same `visitor_hash(ip, user_agent)` used everywhere else.

**The hash salt rotates daily and must stay that way.** That rotation is what
stops a stored hash of an IP from being reversed by trying known addresses. For
a five minute window the rotation buys nothing, but changing the shared hash
would break same-day de-duplication of the permanent visitor count. So the
rotation stays, the same hash is reused, and the live set is stored separately
from the `seen` map for that reason.

`live` is never written to disk. The `_save` method serialises named keys only,
and `live` is not one of them; a test asserts the state file does not gain the
key after a ping, so a future edit cannot start persisting it by accident.

## API

### `POST /api/stats/ping`

Body ignored. Records the caller's presence and returns the current totals
including `live`. Same guard path as the other writes: body drained first, then
cross-site and rate-limit checks. It must not touch `visitors` or `conversions`.

### `GET /api/stats`

Unchanged path, gains one field:

```json
{ "visitors": 70, "conversions": 3, "live": 2 }
```

`Cache-Control: no-store` already applies and is unchanged.

The rate limit is per IP per minute and currently 30. A client pinging every 30
seconds uses 2 of that, alongside one visit and the occasional conversion. No
change needed.

## Client

`StatsCounter` already fetches totals on mount. It gains two timers:

- **ping every 30 s** while mounted, via `setInterval`, cleared on unmount.
  Deliberately not tied to visibility: a tab in the background is still a
  visitor, and browsers already throttle timers in background tabs, so the ping
  slows down on its own.
- **re-read totals every 60 s.** The figure lives five minutes; refreshing it
  more often would show movement that does not mean anything. The ping response
  already carries the totals, so the periodic read could be dropped, but a
  separate read recovers the numbers if pings start failing.

Every failure path stays silent, exactly as today. No offline banner, no error
text, no layout hole.

## Presentation

A second row under the two existing numbers, inside the same container:

- a green dot, pulsing, to read as "live" at a glance
- the count in the same bold tabular-nums style as the other two
- localised label, subject to the same `Intl.PluralRules` treatment the Russian
  counter labels already use

`live` is clamped to a minimum of 1. A visitor who just loaded the page has
already been counted, so 0 would mean the service is behind by up to thirty
seconds. Showing "1" is the least confusing honest answer.

## i18n

`stats.onlineForms` added to all five dictionaries, with the plural categories
each language needs. English, German, Spanish and French repeat `other` for
every category. Russian gets all three forms.

## Privacy

The only thing crossing the wire outward is an integer. The hash is the same
salted SHA-256 already in use, never a raw address. Nothing about presence
reaches disk, so it is absent from the state file, from the access log beyond
the request line itself, and from anything the site could later expose. The
existing privacy page text already states that visitors are counted in an
anonymous way; it needs no change.

## Tests

Added to `scripts/verify-stats.mts`:

- a second ping from the same browser does not raise `live`
- a different browser raises `live` by exactly one
- `live` appears in the `GET` response
- the state file does **not** contain a `live` key after pings, and reloading
  the service does not restore a stale count
- `ping` does not move `visitors` or `conversions`
- expiry drops an entry. Forced by restarting the service, which is the real
  event the in-memory design depends on, rather than by faking a clock
- a cross-site ping is refused with 403

`scripts/verify-static.mts` gains a check that the online row is present in the
built HTML. `scripts/verify-ui.mts` needs no change: it already tolerates the
local `/api/stats` stub.

## Out of scope

Countries, referrers, page-level presence, a private dashboard, and rounding or
clamping the number against inflation. Each was considered and declined.