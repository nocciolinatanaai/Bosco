export const CONSENT_KEY='mythwood.cookie-consent.v1',ROLE_KEY='mythwood.site-role.v1';
export const CONSENT_LIFETIME=180*24*60*60*1000;
const roles=new Set(['tank','fighter','assassin','mage','ranger','healer']);
export function createPrivacyStore(storage=()=>globalThis.localStorage,now=()=>Date.now()){
 let memory=null;
 const remove=key=>{try{storage().removeItem(key);}catch{}};
 function load(){
  if(memory)return memory;
  try{const raw=storage().getItem(CONSENT_KEY);if(raw===null)return memory||{status:'unset',functional:false};
   const value=raw.length<300?JSON.parse(raw):null;
   if(!value||Object.keys(value).sort().join(',')!=='functional,updatedAt,version'||value.version!==1||typeof value.functional!=='boolean'||!Number.isFinite(value.updatedAt)||value.updatedAt>now()||now()-value.updatedAt>=CONSENT_LIFETIME){remove(CONSENT_KEY);remove(ROLE_KEY);return {status:'unset',functional:false};}
   return {status:'saved',functional:value.functional};
  }catch{return memory||{status:'unset',functional:false};}
 }
 return {load,save(functional){if(typeof functional!=='boolean')throw Error('Preferenza non valida');const value={version:1,functional,updatedAt:now()};memory={status:'memory',functional};if(!functional)remove(ROLE_KEY);try{storage().setItem(CONSENT_KEY,JSON.stringify(value));memory=null;return {status:'saved',functional};}catch{return memory;}},
  getRole(){if(!load().functional){remove(ROLE_KEY);return null;}try{const value=storage().getItem(ROLE_KEY);return roles.has(value)?value:null;}catch{return null;}},
  setRole(role){if(!roles.has(role)||!load().functional)return false;try{storage().setItem(ROLE_KEY,role);return true;}catch{return false;}}
 };
}
export const privacyStore=createPrivacyStore();
