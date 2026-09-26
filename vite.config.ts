import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://<user>.github.io/classroom/ — base must match the repo name.
export default defineConfig({
  plugins: [react()],
  base: '/classroom/',
})
