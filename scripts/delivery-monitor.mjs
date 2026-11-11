import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { checkDeliveries } from './lib/delivery-monitor.mjs';
const exec = promisify(execFile);
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('node scripts/delivery-monitor.mjs [--watch] [--interval-seconds 300] [--cycles 96]\nRead-only Git polling; local events/stdout only. Does not awaken an AI chat or send push notifications.');
  process.exit(0);
}
function numeric(flag, fallback, min, max) {
  const at=args.indexOf(flag), value=at<0?fallback:Number(args[at+1]);
  if(!Number.isInteger(value)||value<min||value>max)throw Error(`Invalid ${flag}`);
  return value;
}
const interval=numeric('--interval-seconds',300,60,3600);
const cycles=args.includes('--watch')?numeric('--cycles',96,1,1440):1;
const directory=resolve('.agent-exchange/monitor');
const abort=new AbortController();
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>abort.abort());
async function readRemote(){
  try {
    const {stdout}=await exec('git',['ls-remote','--refs','origin',
      'refs/heads/mythwood/collaboration-base','refs/heads/tonino/*','refs/heads/codex/*','refs/pull/*/head'],
      {timeout:30000,maxBuffer:1024*1024});
    return stdout;
  } catch { throw Error('Remote Git read failed; state unchanged. Check Git access separately.'); }
}
for(let i=0;i<cycles&&!abort.signal.aborted;i++){
  try { console.log(JSON.stringify(await checkDeliveries(directory,readRemote))); }
  catch(error){console.error(JSON.stringify({status:'error',message:error.message,agentAwakened:false,externalNotificationSent:false}));process.exitCode=1;}
  if(i+1<cycles&&!abort.signal.aborted){try{await delay(interval*1000,undefined,{signal:abort.signal});}catch(error){if(error.name!=='AbortError')throw error;}}
}
