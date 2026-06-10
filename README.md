# OpenBikeMap.org

Interactive map focused on bicycle trails and cycling infrastructure, inspired by [OpenSkiMap.org](https://openskimap.org).

## Architecture

Like OpenSkiMap, the full system is split across several components:

| Component | Status | Role |
|-----------|--------|------|
| **Frontend** (this repo) | In progress | React SPA with MapLibre |
| **Data processor** | Planned | OSM → MVT + GeoJSON |
| **REST API** | Planned | Search + feature details |
| **Tile server** | Planned | MapLibre styles + vector tiles |

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

## License

Apache License 2.0
