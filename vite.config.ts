import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /**
   * Dev-server tweaks
   *  • strictPort forces Vite to fail if the desired port is taken rather than
   *    silently incrementing (helps avoid “mystery” redirects).
   *  • host:true lets you open the site on your LAN or inside Docker.
   *  • headers disable browser caching so hot-reloaded code is always fresh.
   */
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    headers: {
      'Cache-Control': 'no-store',
      Pragma: 'no-cache',
    },
  },
  /**
   * Build & global flags
   *  • We explicitly disable service-worker registration by exposing an env
   *    constant our runtime can check (`import.meta.env.SERVICE_WORKER === "true"`).
   *    This is a safety net – the app also unregisters any rogue SWs at runtime.
   */
  define: {
    'import.meta.env.SERVICE_WORKER': JSON.stringify('false'),
  },
})
