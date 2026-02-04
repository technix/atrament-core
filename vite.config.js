import { defineConfig } from 'vite'; /* eslint-disable-line */
import bundlesize from 'vite-plugin-bundlesize';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    bundlesize({
      limits: [
        { name: 'index.cjs', limit: '6 kB', mode: 'gzip' },
        { name: 'index.mjs', limit: '6 kB', mode: 'gzip' }
      ]
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  build: {
    sourcemap: 'hidden',
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
