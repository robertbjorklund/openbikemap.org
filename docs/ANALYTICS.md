# Analytics setup (Cloudflare + Matomo)

OpenBikeMap uses two complementary analytics layers:

| Layer | Purpose | Where it runs |
|-------|---------|---------------|
| **Cloudflare Web Analytics** | Traffic: visitors, referrers, countries, devices | Cloudflare (cookieless) |
| **Matomo** | Product: search, filters, GPX downloads, basemap, feedback | Self-hosted on VPS |

Both are optional in local dev. Production enables them via **Cloudflare build variables** (baked into the frontend at build time).

---

## 1. Cloudflare Web Analytics (~5 min)

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Analytics & Logs** → **Web Analytics**.
2. Click **Add a site** → enter `openbikemap.org`.
3. Choose **Enable with JavaScript snippet** (required for Workers / SPA deploys).
4. Copy the **beacon token** from the snippet (`data-cf-beacon` → `"token": "..."`).

Add the token to your frontend build (Cloudflare Workers project):

| Variable | Example |
|----------|---------|
| `VITE_CF_BEACON_TOKEN` | `abc123...` |

Path: **Workers & Pages** → **openbikemap** → **Settings** → **Build** → **Variables**.

Redeploy (push to `main` or **Retry deployment**). Verify in browser DevTools → Network: request to `static.cloudflareinsights.com/beacon.min.js`.

View reports: **Analytics & Logs** → **Web Analytics** → `openbikemap.org`.

> **Note:** For a single-page map app, most traffic appears as `/`. Use Matomo events for feature-level insight.

---

## 2. Matomo on the VPS (~20 min)

Matomo runs on the same Hetzner server as tiles and API, on port `8084` (localhost only), proxied by Caddy.

### 2.1 Copy files to VPS

On the server:

```bash
mkdir -p /opt/openbikemap/analytics
cd /opt/openbikemap/analytics
```

Copy from this repo (or clone and copy `infra/matomo/`):

```bash
# From your dev machine (PowerShell):
$ip = "SERVER_IP"
$key = "$env:USERPROFILE\.ssh\id_ed25519"
scp -i $key C:\DEV\openbikemap.org\infra\matomo\docker-compose.prod.yml "root@${ip}:/opt/openbikemap/analytics/"
scp -i $key C:\DEV\openbikemap.org\infra\matomo\.env.prod.example "root@${ip}:/opt/openbikemap/analytics/"
```

On VPS:

```bash
cd /opt/openbikemap/analytics
cp .env.prod.example .env
nano .env   # set MYSQL_ROOT_PASSWORD and MYSQL_PASSWORD (openssl rand -base64 24)
docker compose -f docker-compose.prod.yml up -d
curl -sI http://127.0.0.1:8084/ | head
```

### 2.2 Caddy

Add to `/etc/caddy/Caddyfile`:

```
analytics.openbikemap.org {
    reverse_proxy 127.0.0.1:8084
}
```

```bash
systemctl reload caddy
```

### 2.3 DNS

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `analytics` | `SERVER_IP` | Proxied (orange) |

### 2.4 Matomo wizard

1. Open https://analytics.openbikemap.org/
2. Complete setup (MySQL host: `db`, database `matomo`, user `matomo`, password from `.env`).
3. Create site **OpenBikeMap.org** with URL `https://openbikemap.org`.
4. Note the **Site ID** (usually `1`).

Recommended settings (Matomo → Administration):

- **Privacy** → Anonymize visitor IP (2 bytes)
- **Privacy** → Respect Do Not Track (app already sends this)
- Disable unused plugins if desired

### 2.5 Frontend build variables

Add to Cloudflare **Build** variables:

| Variable | Example |
|----------|---------|
| `VITE_MATOMO_URL` | `https://analytics.openbikemap.org` |
| `VITE_MATOMO_SITE_ID` | `1` |

Redeploy frontend. Verify:

- Browser Network tab → `analytics.openbikemap.org/matomo.js`
- Matomo → **Visitors** → **Real-time**

---

## 3. Build variables checklist (production)

Set all under **Workers & Pages → openbikemap → Settings → Build → Variables**:

| Variable | Required | Example |
|----------|----------|---------|
| `NODE_VERSION` | yes | `24` |
| `VITE_API_BASE_URL` | yes | `https://api.openbikemap.org` |
| `VITE_TILES_BASE_URL` | yes | `https://tiles.openbikemap.org` |
| `VITE_CF_BEACON_TOKEN` | analytics | _(from Web Analytics dashboard)_ |
| `VITE_MATOMO_URL` | analytics | `https://analytics.openbikemap.org` |
| `VITE_MATOMO_SITE_ID` | analytics | `1` |

After changing variables, trigger a new deployment.

---

## 4. What Matomo tracks (already wired in app)

| Event category | Action | When |
|----------------|--------|------|
| Search | Select | User picks a search result |
| Feature | View | Trail or route opened |
| Feature | Download GPX | GPX export |
| Map | Basemap | Terrain / satellite switch |
| Filter | MTB / Routes / … | show / hide |
| Feedback | Open / Submit | Beta feedback dialog |

Cookie policy text updates automatically when analytics env vars are set.

---

## 5. Local development

Leave analytics vars unset in `.env.local` (default). To test:

```env
VITE_CF_BEACON_TOKEN=your-token
VITE_MATOMO_URL=https://analytics.openbikemap.org
VITE_MATOMO_SITE_ID=1
```

Use a separate Matomo site or filter dev traffic by hostname if needed.
