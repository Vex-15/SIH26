import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

// Plugin: serve pre-gzipped .geojson files transparently
// When a request comes in for /data/foo.geojson, if /data/foo.geojson.gz exists,
// serve the .gz bytes with Content-Encoding: gzip so the browser decodes it natively.
function servePrecompressed(): import('vite').Plugin {
  return {
    name: 'serve-precompressed-geojson',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.endsWith('.geojson')) return next();

        const publicDir = path.join(import.meta.dirname, 'public');
        const gzPath = path.join(publicDir, req.url + '.gz');

        if (fs.existsSync(gzPath)) {
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Content-Type', 'application/geo+json');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          fs.createReadStream(gzPath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), servePrecompressed()],
  optimizeDeps: {
    exclude: ['maplibre-gl']
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/maplibre-gl')) {
            return 'maplibre';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        }
      }
    }
  }
})
