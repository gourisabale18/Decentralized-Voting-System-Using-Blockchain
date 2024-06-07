import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve :{
    alias: [{find: "@", replacement: path.resolve(__dirname, "src")},
    { find: "@assets", replacement: path.resolve(__dirname, "src/assets") },
  ],
},
})
