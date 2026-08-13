import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import base44 from "@base44/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  logLevel: "error", // show only errors

  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === "true",
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true,
    }),
    react(),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});