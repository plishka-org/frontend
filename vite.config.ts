import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devProxyTarget = process.env.VITE_DEV_PROXY_TARGET

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    allowedHosts: ['.loca.lt'],
    proxy: devProxyTarget
      ? {
          '/api': {
            target: devProxyTarget,
            changeOrigin: true,
            secure: true,
          },
        }
      : undefined,
  },
})
