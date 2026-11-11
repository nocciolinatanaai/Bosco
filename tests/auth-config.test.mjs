import test from 'node:test';import assert from 'node:assert/strict';import {authConfig,callbackUrl,safeOAuthUrl,authError} from '../src/auth/config.js';
const env={VITE_SUPABASE_URL:'https://mythwood-test.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_abcdefghijklmnopqrstuvwxyz',VITE_AUTH_OPERATOR:'Test operator',VITE_AUTH_CONTACT:'test@example.invalid'};
test('account: configurazione esplicita del progetto nuovo, nessun fallback legacy o chiave riservata',()=>{
 assert.equal(authConfig(),null);const config=authConfig(env);assert.equal(config.url,env.VITE_SUPABASE_URL);
 for(const url of ['http://mythwood-test.supabase.co','https://lxnhcuthmdkpeklucutu.supabase.co','https://attacker.example','https://mythwood-test.supabase.co:9000','https://mythwood-test.supabase.co/path','https://user:password@mythwood-test.supabase.co'])assert.equal(authConfig({...env,VITE_SUPABASE_URL:url}),null);
 for(const key of ['sb_secret_abcdefghijklmnopqrstuvwxyz','eyJservice_role',''])assert.equal(authConfig({...env,VITE_SUPABASE_PUBLISHABLE_KEY:key}),null);
 assert.equal(authConfig({...env,VITE_AUTH_CONTACT:''}),null);
});
test('account: callback locale anche in sottocartella Pages e destinazione OAuth limitata',()=>{
 assert.equal(callbackUrl('https://example.com/Bosco/account.html?next=https://attacker.example'),'https://example.com/Bosco/account.html');
 assert.equal(callbackUrl('https://example.com/Bosco/account.html','recovery'),'https://example.com/Bosco/account.html?intent=recovery');
 const config=authConfig(env);assert.ok(safeOAuthUrl(config.url+'/auth/v1/authorize?provider=google',config));
 for(const url of ['https://attacker.example/auth/v1/authorize','javascript:alert(1)',config.url+'/not-auth'])assert.equal(safeOAuthUrl(url,config),null);
});
test('account: messaggi pubblici non divulgano dettagli server o utenti',()=>{assert.ok(authError({status:429}).includes('Troppe'));assert.ok(authError({code:'invalid_credentials'}).includes('non corrette'));assert.equal(authError({message:'private stack trace'}).includes('private'),false);});
