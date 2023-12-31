import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: "build",
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'observable-duck',
      fileName: 'observable-duck',
    },
    rollupOptions: {
      externals: ['react'],
    }
  }
})