import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'jsdom', include: ['src/components/tough-crowd/*.test.{ts,tsx}'] } })
