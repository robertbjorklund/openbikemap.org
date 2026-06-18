# Security checklist

Actionable checklist derived from [SECURITY.md](SECURITY.md). Check items off as completed. Re-run Phase 1 after major infra or dependency changes.

---

## Phase 1 — Quick audit (1–2 days)

### Dependencies (all repos)

- [ ] Run `yarn npm audit` in `openbikemap.org` and fix or accept documented exceptions
- [ ] Run `npm audit` in `api.openbikemap.org`
- [ ] Enable **Dependabot** or **Renovate** on GitHub for all active repos
- [ ] Note Docker base images in use: `postgres:17-alpine`, `maptiler/tileserver-gl-light`, Matomo image
- [ ] Schedule monthly `docker pull` + rebuild on VPS

### VPS and operations

- [ ] Confirm UFW allows only **22, 80, 443** (see [DEPLOY-VPS.md](DEPLOY-VPS.md))
- [ ] Confirm Postgres is **not** reachable from the public internet (`ss` / `nmap` from outside)
- [ ] Confirm API and tileserver bind to **127.0.0.1** only; public access via Caddy
- [ ] Review `.env` on VPS: strong `POSTGRES_PASSWORD`, no secrets in git
- [ ] SSH: prefer **key-only** login; plan migration from root-only if still root
- [ ] Inventory who has SSH keys and GitHub org access
- [ ] Verify HTTPS works: `https://api.openbikemap.org/health`, `https://tiles.openbikemap.org/health`

### Manual application tests

- [ ] **XSS smoke test:** mock or inject OSM name containing `<script>alert(1)</script>` — info panel and search must not execute script
- [ ] **Search edge cases:** empty query, very long query (10k chars), special chars `& | ! ( ) " '`
- [ ] **GPX export:** download GPX for trail with `&`, `<`, `"` in name — file must be valid XML
- [ ] **Feedback flow:** opens GitHub issue URL only; no data posted to our servers

---

## Phase 2 — Beta hardening

### API (`api.openbikemap.org`)

- [ ] Add **rate limiting** on `/search` (Cloudflare WAF rule, Caddy `rate_limit`, or middleware)
- [ ] Enforce **max query length** on `query` (e.g. 100–200 characters) — return 400 if exceeded
- [ ] Harden search: use `websearch_to_tsquery` or strip `& | ! ( )` from tsquery tokens in `Repository.ts`
- [ ] Add security response headers in Express or Caddy:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin` (or stricter)
- [ ] Document whether CORS `*` remains intentional (public API) in [SECURITY.md](SECURITY.md)

### Frontend (`openbikemap.org`)

- [ ] Add **Content-Security-Policy** via Cloudflare Pages `_headers` or Transform Rules. Minimum allowlist:
  - [ ] `connect-src`: API, tiles, analytics, OpenFreeMap, Esri, Matomo
  - [ ] `script-src`: self, Matomo, Cloudflare beacon, unpkg (RTL plugin) — tighten over time
  - [ ] `img-src`: tile domains, data/blob as needed
- [ ] Add headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (disable unused APIs)
- [ ] Review third-party scripts in `index.html` and [ANALYTICS.md](ANALYTICS.md) against CSP
- [ ] Confirm no new `dangerouslySetInnerHTML` on dynamic/user content

### Tiles (`tiles.openbikemap.org`)

- [ ] Caddy TLS and proxy only — no direct tileserver port on public interface
- [ ] Fix or document tileserver Docker **health check** if showing unhealthy while `/health` OK
- [ ] Restrict write access to `/opt/openbikemap/data/` to deploy user only

### VPS / Matomo

- [ ] Matomo admin: **strong password + 2FA**
- [ ] Matomo: enable **IP anonymization** (last octet or full anonymization per policy)
- [ ] Matomo: restrict admin URL exposure (VPN, IP allowlist, or strong auth only)
- [ ] Caddy access logs enabled and rotated

---

## Phase 3 — Before high traffic / “sharp” production

### Monitoring and incident readiness

- [ ] Uptime monitoring on `/health` for API and tiles (e.g. UptimeRobot, Better Stack)
- [ ] Alert on sustained 5xx or high latency from Caddy or Cloudflare
- [ ] **Backup runbook:** Postgres dump + copy of `openbikemap.mbtiles` and GeoJSON off VPS
- [ ] **Restore drill:** test DB restore and tile swap at least once
- [ ] Document incident contacts and rotation steps for `POSTGRES_PASSWORD`

### CI / supply chain

- [ ] Add `npm audit` (or OSV scanner) to CI — fail or warn on critical CVEs
- [ ] Pin major dependency versions; review lockfile on every release
- [ ] GitHub: require 2FA for org members; least-privilege repo access
- [ ] Cloudflare Pages: restrict who can change build env vars (`VITE_*`)

### Optional (higher assurance)

- [ ] External penetration test on API + VPS
- [ ] Map checklist to **OWASP ASVS Level 1** if formal compliance is needed
- [ ] Bug bounty or responsible disclosure section on About/Credits page

---

## Privacy and GDPR

- [ ] [CookiePolicy.tsx](../src/components/CookiePolicy.tsx) matches actual analytics (Matomo + Cloudflare)
- [ ] Matomo configured per [ANALYTICS.md](ANALYTICS.md); data retention policy set in Matomo UI
- [ ] Privacy policy link (if separate from cookie policy) covers map URL hashes and analytics
- [ ] DPA with **Hetzner** and **Cloudflare** if required for EU users
- [ ] Do not log full search strings in server logs if treating queries as personal data
- [ ] GPX download events in Matomo — documented in privacy text

---

## Per-release smoke (5 minutes)

Run before or after each production deploy:

- [ ] `https://openbikemap.org` loads map and search returns results
- [ ] `https://api.openbikemap.org/health` → `{ "status": "ok" }`
- [ ] `https://tiles.openbikemap.org/health` OK
- [ ] Browser console: no unexpected CSP violations after header changes
- [ ] Cookie/analytics banner still accurate if analytics config changed

---

## OWASP Top 10 quick reference

| ID | Topic | Our priority item |
|----|-------|-----------------|
| A01 | Access control | VPS SSH, secrets |
| A02 | Cryptographic failures | TLS, `.env` passwords |
| A03 | Injection | Search tsquery, XSS smoke test |
| A04 | Insecure design | Rate limit `/search` |
| A05 | Misconfiguration | CSP + security headers |
| A06 | Vulnerable components | npm/Docker audit cadence |
| A07 | Auth failures | Matomo admin |
| A08 | Integrity | CI chain, third-party scripts |
| A09 | Logging/monitoring | Health alerts, access logs |
| A10 | SSRF | Low — no user-controlled fetches |

Full rationale: [SECURITY.md](SECURITY.md).
