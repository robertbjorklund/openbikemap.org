# Deploy tiles + API on a VPS (Hetzner)

Frontend runs on Cloudflare Pages. This guide covers **tiles.openbikemap.org** and **api.openbikemap.org** on a single Ubuntu server with Docker and Caddy.

## Prerequisites

- Ubuntu 24.04 VPS (e.g. Hetzner CX33: 8 GB RAM, 80 GB disk)
- Docker installed, UFW allows 22/80/443
- SSH key login as `root`
- DNS for `openbikemap.org` on Cloudflare (Active)
- Data from [openbikedata-processor](https://github.com/robertbjorklund/openbikedata-processor):
  - `openbikemap.mbtiles`
  - `trails.geojson`
  - `routes.geojson`

Generate data locally (example — Sweden takes hours):

```powershell
cd ..\tiles.openbikemap.org
.\scripts\dev-tiles-sweden.ps1 -NoTileserver
```

Or start with Stockholm for a quick smoke test:

```powershell
.\scripts\dev-tiles.ps1 -NoTileserver
```

---

## 1. Server layout

On the VPS:

```bash
mkdir -p /opt/openbikemap/data
cd /opt/openbikemap
```

Clone repos:

```bash
apt install -y git
git clone https://github.com/robertbjorklund/tiles.openbikemap.org.git tiles
git clone https://github.com/robertbjorklund/api.openbikemap.org.git api
```

---

## 2. Copy data from your PC

Replace `SERVER_IP` with your Hetzner IP.

**PowerShell (from your dev machine):**

```powershell
$ip = "SERVER_IP"
$key = "$env:USERPROFILE\.ssh\id_ed25519"
$src = "C:\DEV\openbikedata-processor\data"

scp -i $key "$src\openbikemap.mbtiles" "root@${ip}:/opt/openbikemap/data/"
scp -i $key "$src\trails.geojson" "root@${ip}:/opt/openbikemap/data/"
scp -i $key "$src\routes.geojson" "root@${ip}:/opt/openbikemap/data/"
```

**On the server — install mbtiles for tileserver:**

```bash
cp /opt/openbikemap/data/openbikemap.mbtiles /opt/openbikemap/tiles/mbtiles/
```

---

## 3. Start API + PostgreSQL

```bash
cd /opt/openbikemap/api
cp .env.prod.example .env
nano .env   # set a strong POSTGRES_PASSWORD
```

Generate a password: `openssl rand -base64 24`

```bash
docker compose -f docker-compose.prod.yaml up -d --build
docker compose -f docker-compose.prod.yaml ps
```

Wait until both services are healthy. Test:

```bash
curl -s http://127.0.0.1:3002/health
```

---

## 4. Import GeoJSON into the API database

```bash
cd /opt/openbikemap/api
docker compose -f docker-compose.prod.yaml exec app npm run import-data:prod -- \
  /data/trails.geojson /data/routes.geojson
```

This can take several minutes for large files. Then test search:

```bash
curl -s "http://127.0.0.1:3002/search?query=stockholm" | head -c 500
```

---

## 5. Start tileserver

```bash
cd /opt/openbikemap/tiles
docker compose -f docker-compose.prod.yml up -d
curl -s http://127.0.0.1:8083/health
curl -sI http://127.0.0.1:8083/styles/terrain/style.json | head
```

---

## 6. Caddy (HTTPS)

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy
```

Create `/etc/caddy/Caddyfile`:

```
tiles.openbikemap.org {
    reverse_proxy 127.0.0.1:8083
}

api.openbikemap.org {
    reverse_proxy 127.0.0.1:3002
}
```

```bash
systemctl enable caddy
systemctl reload caddy
```

---

## 7. Cloudflare DNS

In **DNS** for `openbikemap.org`, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `tiles` | `SERVER_IP` | Proxied (orange) |
| A | `api` | `SERVER_IP` | Proxied (orange) |

Wait 1–5 minutes, then test:

- https://tiles.openbikemap.org/health
- https://api.openbikemap.org/health
- https://openbikemap.org — map should show trails and search should work

---

## 8. Updating data later

1. Re-run processor locally (or on a bigger machine).
2. `scp` new files to `/opt/openbikemap/data/`.
3. `cp` new mbtiles into `tiles/mbtiles/`.
4. `docker compose -f docker-compose.prod.yml restart` in `tiles/`.
5. Re-import API: `docker compose -f docker-compose.prod.yaml exec app npm run import-data:prod -- /data/trails.geojson /data/routes.geojson`

---

## Troubleshooting

| Problem | Check |
|---------|--------|
| Empty map | `curl https://tiles.openbikemap.org/styles/terrain/style.json` |
| Search empty | Import finished? `curl https://api.openbikemap.org/health` |
| 502 from Caddy | `docker compose ps` in tiles/ and api/ |
| CORS errors | API allows `*` — check browser network tab for real URL |
| Out of memory on import | Run import when traffic is low; CX33 has 8 GB |

Tiles and API only listen on `127.0.0.1` — public access is via Caddy on 443.

---

## 9. Security

Threat model, OWASP mapping, and hardening checklists: [SECURITY.md](SECURITY.md) and [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md).

---

## 10. Analytics (optional)

For **Cloudflare Web Analytics** (traffic) and **Matomo** (product events: search, GPX, filters), see [ANALYTICS.md](ANALYTICS.md).

Quick summary:

1. Enable Web Analytics in Cloudflare → copy beacon token → `VITE_CF_BEACON_TOKEN` build var.
2. Run Matomo on VPS (`infra/matomo/`) → `analytics.openbikemap.org` in Caddy → `VITE_MATOMO_URL` + `VITE_MATOMO_SITE_ID`.
3. Redeploy frontend after setting build variables.
