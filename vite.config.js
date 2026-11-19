import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' so the site works at tpoonia.github.io and at tpoonia.github.io/Portfolio
export default defineConfig({ plugins: [react()], base: './', build: { chunkSizeWarningLimit: 1600 } })
