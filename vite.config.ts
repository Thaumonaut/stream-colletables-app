import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 8080,
    host: '127.0.0.1',
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:5000",
    //     changeOrigin: true
    //   }
    // }
  },
  preview: {
    port: 8080,
  },
})
