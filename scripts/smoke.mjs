// Verifies that the published build in dist/ actually loads and works in
// plain Node (both CJS and ESM entry points). Run after `bun run build`.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const check = (label, mod) => {
  const content = mod.createQrPaymentContent(100, '19-2000145399/0800');
  if (!content.startsWith('SPD*1.0*ACC:CZ6508000000192000145399')) {
    throw new Error(`${label} build returned unexpected SPAYD content: ${content}`);
  }

  const svg = mod.createQrPaymentSvg(100, '19-2000145399/0800');
  if (!svg.includes('<svg')) {
    throw new Error(`${label} build returned unexpected SVG output`);
  }
};

check('CJS', require('../dist/cjs/index.js'));
check('ESM', await import('../dist/esm/index.js'));

console.log('dist smoke test passed (CJS + ESM)');
