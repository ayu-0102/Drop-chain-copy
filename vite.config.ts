
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['js-sha256', '@dfinity/agent', '@dfinity/auth-client', '@dfinity/principal', '@dfinity/candid'],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'dfinity': ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/principal', '@dfinity/candid']
        }
      }
    }
  }
}));
