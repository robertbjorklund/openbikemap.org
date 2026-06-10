# OpenBikeMap.org Development Guide

## Build Commands
- `yarn start` - Start development server (port 8081)
- `yarn build` - Build production version
- `yarn check-types` - Run TypeScript type checking
- `yarn pull` - Pull latest code and install dependencies

## Code Style Guidelines
- **Formatting**: Uses Prettier with 2-space indentation
- **Types**: TypeScript with strict type checking
- **Components**: React functional components with hooks (class components used for legacy sidebar pattern)
- **Naming**:
  - PascalCase for components and interfaces
  - camelCase for variables and functions
  - Use descriptive names
- **Imports**: Organize imports automatically on save
- **State Management**: Custom state management with EventBus + StateReducer
- **Branding**: Application-specific values live in `src/AppConfig.ts`

## Repository Structure
- `src/components/` - React components and MapLibre controls
- `src/types/` - Trail type definitions (future shared package)
- `src/utils/` - Camera position and helpers
- `src/AppConfig.ts` - App name, colors, API/tile URLs (swap for OpenHikeMap variant)

## Related Projects (planned)
- `openbikedata-processor` - OSM data pipeline
- `api.openbikemap.org` - Search and GeoJSON API
- `tiles.openbikemap.org` - MapLibre styles and MVT tiles
