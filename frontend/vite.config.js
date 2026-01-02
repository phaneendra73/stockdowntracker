import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the Worker during development
      "/api": "http://127.0.0.1:8787",
      //nned to replace with original API from cloud flare
    },
  },
});
