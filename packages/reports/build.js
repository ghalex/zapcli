const { build } = require('esbuild');

build({
  entryPoints: ['src/index.ts'], // Replace with the entry point of your application
  bundle: true,
  outfile: 'dist/bundle.js',
  // format: 'esm', // ES module format
  platform: 'node', // Neutral platform to support ES modules
  tsconfig: 'tsconfig.json', // Ensure TypeScript configuration is respected
  external: ['@observablehq/plot'],
  plugins: [
  ],
}).catch(() => process.exit(1));