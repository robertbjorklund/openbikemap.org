/// <reference types="vite/client" />

declare const BUILD_TIMESTAMP: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_TILES_BASE_URL?: string;
  readonly VITE_TILES_STYLE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
