import { defineConfig } from 'vite'; /* eslint-disable-line */
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      output: [{
        entryFileNames: '[name].cjs',
        format: 'cjs',
        dir: 'dist'
      }, {
        entryFileNames: '[name].mjs',
        format: 'es',
        dir: 'dist'
      }]
    }
  }
});
