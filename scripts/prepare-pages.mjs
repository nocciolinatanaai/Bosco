// Prepare a generated branch without checking it out or altering the source worktree.
// Does not push, change GitHub settings, or merge main.
import {execFileSync} from 'node:child_process';import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
const root=process.cwd(),branch='refs/heads/mythwood/pages';
const git=(args,extra={})=>execFileSync('git',args,{cwd:root,encoding:'utf8',...extra}).trim();
for(const file of ['index.html','demo.html','account.html','site/mythwood-gameplay.mp4'])await readFile(path.join(root,'dist',file));
const source=git(['rev-parse','HEAD']);
for(const file of git(['ls-files','tiktok*.txt']).split('\n').filter(Boolean)){if(/^tiktok[a-zA-Z0-9]+\.txt$/.test(file))await writeFile(path.join('dist',file),await readFile(file));}await writeFile('dist/CNAME','mythwood.it\n');await writeFile('dist/.nojekyll','');
const tmp=await mkdtemp(path.join(os.tmpdir(),'mythwood-pages-')),env={...process.env,GIT_INDEX_FILE:path.join(tmp,'index')};
try{
 git(['read-tree','--empty'],{env});git(['--git-dir='+path.join(root,'.git'),'--work-tree='+path.join(root,'dist'),'add','--all','--force'],{env,cwd:path.join(root,'dist')});const tree=git(['write-tree'],{env});
 let previous;try{previous=git(['rev-parse','--verify',branch],{stdio:['ignore','pipe','pipe']});}catch{}
 const args=['commit-tree',tree,...(previous?['-p',previous]:[]),'-m',`site: generated build from ${source}`];const commit=git(args);
 git(['update-ref',branch,commit,...(previous?[previous]:['0000000000000000000000000000000000000000'])]);
 console.log(JSON.stringify({source,branch:'mythwood/pages',commit,pushed:false,activation:'GitHub Settings > Pages > Deploy from a branch > mythwood/pages / root'},null,2));
}finally{await rm(tmp,{recursive:true,force:true});}
