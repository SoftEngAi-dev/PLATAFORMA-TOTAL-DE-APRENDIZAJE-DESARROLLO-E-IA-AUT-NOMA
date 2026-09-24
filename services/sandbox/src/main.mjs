import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { SANDBOX_POLICY, safeRelativePath } from './policy.mjs';

const port=Number(process.env.SANDBOX_PORT || 8791);
const workspaceRoot=path.resolve(process.env.PLATAFORMA_WORKSPACE || path.join(process.env.HOME || process.cwd(),'PlataformaWorkspace'));
const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));};
const readBody=req=>new Promise((resolve,reject)=>{let value='';req.on('data',c=>value+=c.toString());req.on('end',()=>resolve(value));req.on('error',reject);});
const insideWorkspace=candidate=>{const c=path.resolve(candidate);return c===workspaceRoot || c.startsWith(workspaceRoot+path.sep);};

createServer(async(req,res)=>{
  if(req.method!=='POST'||req.url!=='/v1/run')return send(res,404,{error:'Not found'});
  try{
    const body=JSON.parse(await readBody(req));
    const workspace=path.resolve(String(body.workspace || ''));
    if(!workspace||!insideWorkspace(workspace))throw new Error('Workspace fuera de la raíz permitida.');
    const entrypoint=safeRelativePath(body.entrypoint || '');
    const image=String(body.image || 'node:22-alpine');
    const target=path.join('/workspace',entrypoint);
    const args=['run','--rm','--network=none','--read-only','--memory=1g','--cpus=1','--pids-limit=128','--tmpfs=/tmp:rw,nosuid,size=256m','-v',workspace+':/workspace:ro',image,'node',target];
    const child=spawn('docker',args,{stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    child.stdout.on('data',c=>{stdout+=c.toString();if(stdout.length>200000)child.kill();});
    child.stderr.on('data',c=>{stderr+=c.toString();if(stderr.length>200000)child.kill();});
    const timer=setTimeout(()=>child.kill('SIGKILL'),SANDBOX_POLICY.timeoutMs);
    child.on('close',code=>{clearTimeout(timer);send(res,200,{code,stdout:stdout.slice(0,200000),stderr:stderr.slice(0,200000),policy:SANDBOX_POLICY});});
  }catch(error){send(res,400,{error:error.message || 'Petición inválida'});}
}).listen(port,'127.0.0.1',()=>console.log('Plataforma sandbox: http://127.0.0.1:'+port));
