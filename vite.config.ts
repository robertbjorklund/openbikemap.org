import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "https://tiles.openbikemap.org" ||
              url.origin === "https://tiles.openfreemap.org",
            handler: "NetworkFirst",
            options: {
              cacheName: "tiles-cache-v1",
              expiration: {
                maxEntries: 50000,
                maxAgeSeconds: 60 * 60 * 24 * 7,
                purgeOnQuotaError: true,
              },
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
    }),
  ],

  define: {
    BUILD_TIMESTAMP: JSON.stringify(Date.now().toString()),
  },

  server: {
    port: 8081,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".css"],
  },
});
