
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
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.REACT_APP_CANISTER_ID': JSON.stringify(process.env.REACT_APP_CANISTER_ID || 'rdmx6-jaaaa-aaaah-qdrva-cai'),
    'process.env.REACT_APP_INTERNET_IDENTITY_CANISTER_ID': JSON.stringify(process.env.REACT_APP_INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaah-qdrva-cai'),
    'process.env.REACT_APP_DFX_NETWORK': JSON.stringify(process.env.REACT_APP_DFX_NETWORK || 'local'),
  },
}));
