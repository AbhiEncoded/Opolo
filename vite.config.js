import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure the env var resolves to an empty string if not set,
    // rather than throwing a ReferenceError at runtime
    'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(
      process.env.VITE_ANTHROPIC_API_KEY || ''
    ),
  },
})
