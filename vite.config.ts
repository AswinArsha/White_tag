import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import fs from "fs"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // allow LAN access
    https: {
      key: fs.readFileSync('./192.168.1.3+2-key.pem'),
      cert: fs.readFileSync('./192.168.1.3+2.pem'),
    },
  },
})
