import { defineConfig, loadEnv } from 'vite';
import { authConfig } from './src/auth/config.js';
export default defineConfig(({mode})=>{
 const auth=authConfig(loadEnv(mode,process.cwd(),'VITE_'));
 return {
  base:'./',server:{host:'127.0.0.1',fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/attachments/**']}},
  plugins:[{name:'account-csp',transformIndexHtml(html,ctx){return auth&&ctx.path==='/account.html'?html.replace("connect-src 'self'",`connect-src 'self' ${auth.url}`):html;}}],
  build:{target:'es2022',sourcemap:false,rolldownOptions:{input:{site:'index.html',demo:'demo.html',account:'account.html'}}}
 };
});
