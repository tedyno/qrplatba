import { rm, writeFile } from 'node:fs/promises';
import { $ } from 'bun';

await rm('dist', { recursive: true, force: true });

// Type declarations (specs are excluded via tsconfig).
await $`tsc -p tsconfig.json --emitDeclarationOnly --outDir dist/types`;

const shared = {
  entrypoints: ['src/index.ts'],
  target: 'node',
  external: ['qrcode-generator'],
} as const;

const esm = await Bun.build({ ...shared, outdir: 'dist/esm', format: 'esm' });
const cjs = await Bun.build({ ...shared, outdir: 'dist/cjs', format: 'cjs' });

if (!esm.success || !cjs.success) {
  console.error(...esm.logs, ...cjs.logs);
  process.exit(1);
}

// Mark each output directory so Node resolves the right module system.
await writeFile('dist/esm/package.json', JSON.stringify({ type: 'module' }, null, 2) + '\n');
await writeFile('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');
