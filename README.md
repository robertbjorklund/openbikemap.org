# OpenBikeMap.org

Interactive map focused on bicycle trails and cycling infrastructure, inspired by [OpenSkiMap.org](https://openskimap.org).

## Architecture

Like OpenSkiMap, the full system is split across several components:

| Component | Status | Role |
|-----------|--------|------|
| **Frontend** (this repo) | In progress | React SPA with MapLibre |
| **Data processor** | Available | OSM → MVT + GeoJSON |
| **REST API** | Available | Search + feature details |
| **Tile server** | Available | MapLibre styles + vector tiles |

A future [OpenHikeMap.org](https://openhikemap.org) variant can reuse the same architecture by swapping `src/AppConfig.ts` and trail type definitions.

## Prerequisites

- Node.js version in `.nvmrc`
- Yarn 4

## Development

```bash
yarn install
yarn start
```

The dev server runs at http://localhost:8081.

### Local tiles (see bike trails on the map)

```powershell
# 1. Generate tiles + start tileserver
cd ..\tiles.openbikemap.org
.\scripts\dev-tiles.ps1

# 2. Configure frontend
cd ..\openbikemap.org
copy .env.local.example .env.local

# 3. Start frontend
yarn start
```

The map loads `http://localhost:8083/styles/terrain/style.json` with Stockholm test data by default.

## Scripts

- `yarn start` — development server
- `yarn build` — production build
- `yarn check-types` — TypeScript type checking
- `yarn preview` — preview production build

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `https://api.openbikemap.org` | REST API base URL |
| `VITE_TILES_BASE_URL` | `https://tiles.openbikemap.org` | Tile server base URL |
| `VITE_TILES_STYLE_PATH` | `/styles/terrain/style.json` | MapLibre style path on tileserver-gl |

## License

Apache License 2.0
