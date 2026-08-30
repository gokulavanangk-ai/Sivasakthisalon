import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const run = (cmd, cwd) => {
  console.log(`\n> ${cmd}  (${cwd})\n`);
  execSync(cmd, { cwd, stdio: 'inherit' });
};

// The backend must be compiled to CommonJS (backend/dist) BEFORE the
// api/index.ts serverless function is bundled, and the frontend must be built
// to frontend/dist so Vercel can serve it from the filesystem.
run('npm install --no-audit --no-fund', join(root, 'backend'));
run('npm run build', join(root, 'backend'));
if (process.env.VERCEL_ENV !== 'production') {
  run('npm install --no-audit --no-fund', join(root, 'frontend'));
}
run('npm run build', join(root, 'frontend'));