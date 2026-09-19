// Reproduces the real GitHub Pages layout locally: the built app (whose
// index.html has <base href="/DUD-E/">) must be reachable under a /DUD-E/
// path prefix, not served at a bare server root — otherwise every asset
// reference and the 404.html fallback trick would resolve to the wrong path.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const buildOutput = resolve(repoRoot, 'dist', 'dud-e', 'browser');
const siteRoot = resolve(here, '..', '.tmp', 'site');
const siteTarget = resolve(siteRoot, 'DUD-E');

if (!existsSync(buildOutput)) {
  console.error(`Build output not found at ${buildOutput}. Run "ng build" first.`);
  process.exit(1);
}

rmSync(siteRoot, { recursive: true, force: true });
cpSync(buildOutput, siteTarget, { recursive: true });

console.log(`Prepared static site: ${buildOutput} -> ${siteTarget}`);
