import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const original = await readFile('package-lock.json', 'utf8');
const lock = JSON.parse(original);
const entries = Object.entries(lock.packages).filter(([path]) => path !== '');
const directory = '.public-lock-verification';
await mkdir(directory);
const verified = [];
const unavailable = [];
const npm = async (args) => {
  const { stdout } = await run('npm', [
    ...args, '--registry=https://registry.npmjs.org/',
    '--fetch-retries=0', '--fetch-timeout=30000',
  ], { maxBuffer: 8 * 1024 * 1024 });
  return JSON.parse(stdout);
};

for (let offset = 0; offset < entries.length; offset += 4) {
  await Promise.all(entries.slice(offset, offset + 4).map(async ([path, pkg]) => {
    const name = pkg.name || path.split('node_modules/').at(-1);
    const spec = `${name}@${pkg.version}`;
    let metadata;
    try {
      metadata = await npm(['view', spec, 'name', 'version', 'dist', '--json']);
    } catch (error) {
      if (!error.stderr?.includes('E404')) throw error;
      unavailable.push(spec);
      return;
    }
    if (metadata.name !== name || metadata.version !== pkg.version) throw new Error(`Identity mismatch: ${spec}`);
    const { dist } = metadata;
    const url = new URL(dist.tarball);
    if (url.origin !== 'https://registry.npmjs.org' || url.username || url.password || url.search) {
      throw new Error(`Not an unauthenticated public npm tarball: ${spec}`);
    }
    if (!/^sha512-[A-Za-z0-9+/]{86}==$/.test(dist.integrity)) throw new Error(`Missing public SHA-512: ${spec}`);
    const publicSha1 = `sha1-${Buffer.from(dist.shasum, 'hex').toString('base64')}`;
    if (![publicSha1, dist.integrity].includes(pkg.integrity)) throw new Error(`Original integrity mismatch: ${spec}`);
    verified.push({ path, spec, dist });
  }));
  console.log(`Checked public metadata: ${Math.min(offset + 4, entries.length)}/${entries.length}`);
}

await writeFile('public-lock-verification.json', JSON.stringify({ verified, unavailable }, null, 2) + '\n');
if (unavailable.length) throw new Error(`Approval required before changing unavailable versions:\n${unavailable.join('\n')}`);

for (let offset = 0; offset < verified.length; offset += 8) {
  const batch = verified.slice(offset, offset + 8);
  const packed = await npm([
    'pack', ...batch.map(({ dist }) => dist.tarball), '--json',
    '--ignore-scripts', `--pack-destination=${directory}`,
  ]);
  if (packed.length !== batch.length) throw new Error('Unexpected npm pack result count');
  for (let index = 0; index < batch.length; index++) {
    const { path, spec, dist } = batch[index];
    const filename = packed[index].filename;
    if (filename.includes('/') || filename.includes('\\')) throw new Error(`Unexpected tarball filename: ${spec}`);
    const file = join(directory, filename);
    const bytes = await readFile(file);
    const sha1 = createHash('sha1').update(bytes).digest('hex');
    const sha512 = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
    if (sha1 !== dist.shasum || sha512 !== dist.integrity) throw new Error(`Downloaded integrity mismatch: ${spec}`);
    lock.packages[path].resolved = dist.tarball;
    lock.packages[path].integrity = dist.integrity;
    await rm(file);
  }
  console.log(`Verified downloaded tarballs: ${Math.min(offset + 8, verified.length)}/${verified.length}`);
}

const before = JSON.parse(original);
const graph = (pkg) => {
  const { resolved, integrity, ...rest } = pkg;
  return rest;
};
for (const [path, pkg] of Object.entries(lock.packages)) {
  if (JSON.stringify(graph(pkg)) !== JSON.stringify(graph(before.packages[path]))) throw new Error(`Dependency graph changed: ${path}`);
}
if (await readFile('package-lock.json', 'utf8') !== original) throw new Error('Lockfile changed during verification');
await writeFile('package-lock.json', JSON.stringify(lock, null, 2) + '\n');
await rmdir(directory);
console.log(`Verified ${verified.length} public tarballs. Versions and dependency graph unchanged.`);
