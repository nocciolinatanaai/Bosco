import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { queueRequest, processNext, reviewPrompt } from './lib/agent-exchange.mjs';
const exec = promisify(execFile), root = process.cwd(), queue = path.resolve(process.env.MYTHWOOD_EXCHANGE_DIR || '.agent-exchange');
const [command, ...args] = process.argv.slice(2);
async function installed() { try { await exec('claude', ['--version']); return true; } catch { return false; } }
try {
  if (command === 'status') console.log(JSON.stringify({ queue, claudeCliInstalled: await installed(), liveConnectionVerified: false, transport: 'local directory; remote sharing not configured', billing: 'no model call performed' }, null, 2));
  else if (command === 'request') {
    const [question, ...files] = args;
    const request = await queueRequest(root, queue, question, files);
    console.log(JSON.stringify({ id: request.id, commit: request.commit, status: 'queued-locally', deliveredToClaude: false }, null, 2));
  } else if (command === 'work-once') {
    if (!args.includes('--allow-model-call')) throw Error('Usare --allow-model-call solo dove Claude è già autenticato e il consumo è autorizzato');
    if (!await installed()) throw Error('Claude CLI assente: nessuna chiamata o connessione eseguita');
    if (process.env.ANTHROPIC_API_KEY) throw Error('API a consumo rilevata: questo ponte richiede una sessione Claude Code già autenticata; nessuna spesa API automatica');
    const reply = await processNext(queue, async request => {
      const { stdout } = await exec('claude', ['-p', reviewPrompt(request), '--tools', '', '--permission-mode', 'plan', '--no-session-persistence', '--output-format', 'json'], { cwd: root, timeout: 180000, maxBuffer: 200000 });
      const result = JSON.parse(stdout);
      if (result.is_error || result.subtype !== 'success' || typeof result.result !== 'string') throw Error('Claude non ha restituito una revisione riuscita');
      return { provider: 'claude-code-cli', text: result.result };
    });
    console.log(JSON.stringify(reply ? { status: 'reply-recorded', id: reply.id, commit: reply.commit } : { status: 'empty' }));
  } else throw Error('Comandi: status | request "domanda" file... | work-once --allow-model-call');
} catch (error) { console.error(error.message); process.exitCode = 1; }
