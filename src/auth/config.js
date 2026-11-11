const LEGACY_PROJECT='lxnhcuthmdkpeklucutu.supabase.co';
export function authConfig(env={}) {
 try {
  const url=new URL(env.VITE_SUPABASE_URL||'');
  if(url.protocol!=='https:'||!(/^[a-z0-9-]+\.supabase\.co$/).test(url.hostname)||url.hostname===LEGACY_PROJECT||url.port||url.username||url.password||url.search||url.hash||url.pathname!=='/')return null;
  const key=env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
  if(!/^sb_publishable_[a-zA-Z0-9_-]{20,}$/.test(key))return null;
  const operator=(env.VITE_AUTH_OPERATOR||'').trim(),contact=(env.VITE_AUTH_CONTACT||'').trim();
  if(!operator||operator.length>150||!/^\S+@\S+\.\S+$/.test(contact))return null;
  return {url:url.origin,key,operator,contact};
 }catch{return null;}
}
export function callbackUrl(location,intent='login') {
 const url=new URL('./account.html',location);if(intent==='recovery')url.searchParams.set('intent','recovery');return url.href;
}
export function safeOAuthUrl(value,config) {
 try{const url=new URL(value);return url.protocol==='https:'&&url.origin===new URL(config.url).origin&&url.pathname==='/auth/v1/authorize'?url.href:null;}catch{return null;}
}
export function authError(error) {
 if(error?.status===429)return 'Troppe richieste. Attendi prima di riprovare.';
 if(error?.code==='email_not_confirmed')return 'Conferma l’email prima di accedere.';
 if(error?.code==='weak_password')return 'Scegli una password più lunga e difficile da indovinare.';
 if(error?.code==='invalid_credentials')return 'Email o password non corrette.';
 return 'Operazione non completata. Controlla i dati e riprova. Se il problema continua, contatta il progetto.';
}
