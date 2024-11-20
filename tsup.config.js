import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  dts: true,
  format: ['esm'],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },

  // Add this
  esbuildOptions(options) {
    options.external = ['@atproto/common'];
  },
});
