import { mkdir, readFile, writeFile, rename, open, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const allowed = ref => ref === 'refs/heads/mythwood/collaboration-base'
  || /^refs\/heads\/(tonino|codex)\/[^\s]+$/.test(ref)
  || /^refs\/pull\/\d+\/head$/.test(ref);

export function parseRefs(stdout) {
  const refs = {};
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    const [sha, ref, extra] = line.trim().split(/\s+/);
    if (extra || !/^[a-f0-9]{40}([a-f0-9]{24})?$/.test(sha) || !ref) throw Error('Malformed Git ref response');
    if (allowed(ref)) refs[ref] = sha;
  }
  return refs;
}

export function changedRefs(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
    .filter(ref => before[ref] !== after[ref])
    .map(ref => ({ ref, before: before[ref] ?? null, after: after[ref] ?? null }));
}

export async function checkDeliveries(directory, readRemote) {
  await mkdir(directory, { recursive: true });
  // Do not let two monitors overwrite each other's baseline or emit duplicates.
  const lockPath = join(directory, 'check.lock');
  let lock;
  try { lock = await open(lockPath, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw Error('Monitor check already locked'); throw error; }
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    let previous = null;
    try { previous = JSON.parse(await readFile(join(directory, 'state.json'), 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw Error('Unreadable monitor state; refusing to overwrite it'); }
    if (previous && (previous.version !== 1 || !previous.refs || typeof previous.refs !== 'object' || Array.isArray(previous.refs)
      || Object.entries(previous.refs).some(([ref, sha]) => !allowed(ref) || typeof sha !== 'string' || !/^[a-f0-9]{40}([a-f0-9]{24})?$/.test(sha)))) {
      throw Error('Invalid monitor state; refusing to overwrite it');
    }
    // A failed read must never erase refs or be interpreted as deleted branches.
    const refs = parseRefs(await readRemote());
    if (!refs['refs/heads/mythwood/collaboration-base']) throw Error('Collaboration branch missing; refusing baseline update');
    const checkedAt = new Date().toISOString();
    const changes = previous ? changedRefs(previous.refs, refs) : [];
    let event = null;
    if (changes.length) {
      event = { version: 1, id: randomUUID(), type: 'git-delivery', checkedAt, changes,
        reviewStatus: 'unread', userDecision: 'not-assessed', agentAwakened: false, externalNotificationSent: false };
      await mkdir(join(directory, 'events'), { recursive: true });
      await writeFile(join(directory, 'events', event.id + '.json'), JSON.stringify(event, null, 2) + '\n', { flag: 'wx' });
    }
    const temporary = join(directory, 'state.' + randomUUID() + '.tmp');
    await writeFile(temporary, JSON.stringify({ version: 1, checkedAt, refs }, null, 2) + '\n');
    await rename(temporary, join(directory, 'state.json'));
    return { status: previous ? changes.length ? 'new-delivery' : 'unchanged' : 'baseline-recorded', checkedAt,
      refs, event, agentAwakened: false, externalNotificationSent: false };
  } finally { await lock.close(); await unlink(lockPath); }
}
