import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
  react(),
  VitePWA({
    registerType: "autoUpdate",
    manifest: {
      name: "Pretty Sure",
      short_name: "Pretty Sure",
      description: "A prediction journal that holds you to your odds.",
      theme_color: "#0f4a33",
      background_color: "#0f4a33",
      display: "standalone",
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
  }),
]
})

