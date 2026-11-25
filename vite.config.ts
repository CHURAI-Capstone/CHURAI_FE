import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(
          new URL('./src', import.meta.url),
        ),
      },
    },

    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})