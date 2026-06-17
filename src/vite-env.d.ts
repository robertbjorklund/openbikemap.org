/// <reference types="vite/client" />

declare const BUILD_TIMESTAMP: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_TILES_BASE_URL?: string;
  readonly VITE_TILES_STYLE_PATH?: string;
  readonly VITE_MATOMO_URL?: string;
  readonly VITE_MATOMO_SITE_ID?: string;
  readonly VITE_CF_BEACON_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
