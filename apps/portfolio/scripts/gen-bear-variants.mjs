// One-off asset pipeline — generates WebP + AVIF variants of bear-coding.png
// for use as the Hero background. Run via:
//   pnpm --filter @maber/portfolio dlx sharp-cli ...
// or from repo root:
//   npx -y --package=sharp@0.33 node apps/portfolio/scripts/gen-bear-variants.mjs
//
// See Portfolio_Redesign_Spec.md §0.9. Spec calls for ~85% quality WebP and
// AVIF in the 30–35 min/max range. Outputs land beside the source PNG so the
// Hero <picture> element can prefer-modern with PNG fallback.

import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = resolve(__dirname, '..', 'static', 'images');
const src = resolve(staticDir, 'bear-coding.png');
const webpOut = resolve(staticDir, 'bear-coding.webp');
const avifOut = resolve(staticDir, 'bear-coding.avif');

const fmtSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const srcSize = statSync(src).size;
console.log(`source: bear-coding.png (${fmtSize(srcSize)})`);

const input = readFileSync(src);

// WebP — quality 85 typically gives 30–50% size reduction at visual parity
const webp = await sharp(input).webp({ quality: 85, effort: 6 }).toBuffer();
writeFileSync(webpOut, webp);
console.log(`  → bear-coding.webp (${fmtSize(webp.length)}, ${((webp.length / srcSize) * 100).toFixed(1)}% of PNG)`);

// AVIF — slower to encode but ~50% smaller again. Quality scale differs from WebP;
// 50–60 is "high quality". effort 6 = balanced encode time vs compression.
const avif = await sharp(input).avif({ quality: 55, effort: 6 }).toBuffer();
writeFileSync(avifOut, avif);
console.log(`  → bear-coding.avif (${fmtSize(avif.length)}, ${((avif.length / srcSize) * 100).toFixed(1)}% of PNG)`);
