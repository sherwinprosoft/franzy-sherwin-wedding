import { randomBytes, scryptSync } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface, emitKeypressEvents } from 'node:readline';
import path from 'node:path';

// Run in the wedding project. Passwords are entered in the terminal and only
// salted scrypt hashes are saved; no credentials are printed or committed.
if (!process.stdin.isTTY) throw new Error('Run this setup directly in an interactive terminal.');
const root = process.cwd();
const envFile = path.join(root, '.env.local');
let existing = ''; try { existing = await readFile(envFile, 'utf8'); } catch {}
const get = name => existing.match(new RegExp('^' + name + '=(.*)$', 'm'))?.[1]?.trim().replace(/^"|"$/g, '') || '';
async function question(prompt) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, answer => { rl.close(); resolve(answer.trim()); }));
}
async function password(prompt) {
  process.stdout.write(prompt);
  emitKeypressEvents(process.stdin); process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const done = () => { process.stdin.off('keypress', key); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); };
    function key(text, event) {
      if (event?.ctrl && event.name === 'c') { done(); reject(new Error('Setup cancelled. No files were changed.')); }
      else if (event?.name === 'return') { done(); resolve(value); }
      else if (event?.name === 'backspace') value = value.slice(0, -1);
      else if (text && !event?.ctrl && !event?.meta) value += text;
    }
    process.stdin.on('keypress', key);
  });
}
function hash(value) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(value, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('hex')}`;
}
const values = {};
for (const role of ['HOST', 'COORDINATOR']) {
  const name = `RECEPTION_${role}_PASSWORD_HASH`;
  if (get(name)) { values[name] = get(name); continue; }
  const value = await password(`Choose the ${role.toLowerCase()} password (at least 12 characters; hidden): `);
  if (value.length < 12 || value.length > 1024) throw new Error('Use a password of 12 to 1024 characters. No files were changed.');
  if (value !== await password('Enter it again: ')) throw new Error('Passwords did not match. No files were changed.');
  values[name] = hash(value);
}
values.RECEPTION_SESSION_SECRET = get('RECEPTION_SESSION_SECRET') || randomBytes(48).toString('hex');
values.RECEPTION_BACKEND_SECRET = get('RECEPTION_BACKEND_SECRET') || randomBytes(48).toString('hex');
const backend = get('RECEPTION_BACKEND_URL') || await question('Reception Worker URL (leave blank until deployed): ');
if (backend && !/^https:\/\/[^\s/]+(?:\/)?$/.test(backend)) throw new Error('Use the HTTPS Worker origin with no path. No files were changed.');
values.RECEPTION_BACKEND_URL = backend;
for (const [name, value] of Object.entries(values)) {
  const line = `${name}=${value}`;
  const pattern = new RegExp('^' + name + '=.*$', 'm');
  existing = pattern.test(existing) ? existing.replace(pattern, line) : existing.trimEnd() + '\n' + line + '\n';
}
await writeFile(envFile, existing, { mode: 0o600 });
await writeFile(path.join(root, '.env.reception.vercel'), Object.entries(values).map(([name,value]) => `${name}=${value}`).join('\n') + '\n', { mode: 0o600 });
await writeFile(path.join(root, 'cloudflare/reception/.dev.vars'), `SERVICE_SECRET=${values.RECEPTION_BACKEND_SECRET}\n`, { mode: 0o600 });
console.log('Saved private configuration locally. Existing RSVP settings were preserved.');
console.log('Import .env.reception.vercel into this wedding project’s Vercel environment variables.');
console.log('Keep both environment files private. Do not paste their contents into chat or commit them.');
