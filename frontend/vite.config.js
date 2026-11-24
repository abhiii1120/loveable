import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
   server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: true,
      },
      "/runtime":{
         target: 'http://localhost',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/runtime\/[^/]+/, '') || '/',
        configure(proxy) {
          proxy.on('proxyReq',(proxyRequest,request) => {
            const runtimeId = request.headers['x-runtime-id']

            if(typeof runtimeId === 'string' && runtimeId){
              proxyRequest.setHeader('host',`${runtimeId}.file-system.localhost`)
              proxyRequest.removeHeader('x-runtime-id')
            }
          })
        }
      }
    },
  },
  resolve:{
    alias:{
      "@": path.resolve(import.meta.dirname, "./src"),
    }
  }
})
