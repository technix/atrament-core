import { defineConfig } from 'vite'; /* eslint-disable-line */
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es', 'cjs']
    }
  }
});
