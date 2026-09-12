/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function keepOnlyHtml(): Plugin {
  return {
    name: 'keep-only-html',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(rootDir, 'dist')
      if (!fs.existsSync(distDir)) {
        return
      }

      for (const name of fs.readdirSync(distDir)) {
        if (name === 'index.html') {
          continue
        }
        fs.rmSync(path.join(distDir, name), { recursive: true, force: true })
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteSingleFile({
      removeViteModuleLoader: true,
    }),
    keepOnlyHtml(),
  ],
  resolve: {
    alias: {
      stream: path.resolve(rootDir, 'src/shims/stream.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
