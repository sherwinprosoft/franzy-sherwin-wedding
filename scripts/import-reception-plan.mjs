import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Restores missing records into an empty/new backend. Existing records,
// including deletion tombstones, are never overwritten.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Usage: node scripts/import-reception-plan.mjs /absolute/path/to/plan.json');
const env = await readFile(path.join(root, '.env.local'), 'utf8');
const get = name => env.match(new RegExp('^' + name + '=(.*)$', 'm'))?.[1]?.trim().replace(/^"|"$/g, '') || '';
const origin = get('RECEPTION_BACKEND_URL'), secret = get('RECEPTION_BACKEND_SECRET');
if (!origin.startsWith('https://') || secret.length < 32) throw new Error('Configure the private backend first.');
const backup = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (backup.format !== 'reception-desk' || backup.schema !== 1) throw new Error('Choose a Reception Desk JSON backup.');
if (Object.keys(backup.state?.uploads || {}).length) throw new Error('The backup has unshared attachments. Preserve those files separately before importing.');
const records = backup.state?.records ? Object.fromEntries(Object.entries(backup.state.records).map(([key, row]) => [key, row.data])) : backup.records;
const headers = { authorization: 'Bearer ' + secret, 'content-type': 'application/json', 'x-reception-actor': 'Plan import' };
const response = await fetch(new URL('/state', origin), { headers });
if (!response.ok) throw new Error('Could not read the current plan: ' + response.status);
const current = (await response.json()).records;
let imported = 0;
for (const [key, data] of Object.entries(records)) {
  if (Object.hasOwn(current, key) || data === null) continue;
  if (key.startsWith('media:') && data.url?.startsWith('/library/')) data.url = '/reception' + data.url;
  const result = await fetch(new URL('/sync', origin), { method: 'POST', headers, body: JSON.stringify({ id: randomUUID(), key, data, baseRev: 0 }) });
  if (result.status === 409) continue;
  if (!result.ok) throw new Error('A record could not be imported: ' + key + ' (' + result.status + ')');
  imported++;
}
console.log(`Imported ${imported} missing record(s). Existing plan records were preserved.`);
