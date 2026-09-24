import { createServer } from 'node:http';
import { askProvider, checkOllama, configuredProviders } from './providers.mjs';

const port=Number(process.env.AI_ORCHESTRATOR_PORT || 8790);
const origin=process.env.AI_ALLOWED_ORIGIN || 'http://127.0.0.1:5173';
const workspaceRoot=process.env.PLATAFORMA_WORKSPACE || ((process.env.HOME || process.cwd()) + '/PlataformaWorkspace');
const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});res.end(JSON.stringify(body));};
const readBody=req=>new Promise((resolve,reject)=>{let value='';req.on('data',chunk=>{value+=chunk.toString();if(value.length>1000000)reject(new Error('Payload demasiado grande.'));});req.on('end',()=>resolve(value));req.on('error',reject);});
const server=createServer(async(req,res)=>{
  if(req.method==='OPTIONS')return send(res,204,{});
  if(req.url==='/health'&&req.method==='GET')return send(res,200,{ok:true,providers:configuredProviders(),ollamaReachable:await checkOllama(),workspaceRoot});
  if(req.url==='/v1/plan'&&req.method==='POST'){try{const input=JSON.parse(await readBody(req));if(!input.prompt?.trim())return send(res,400,{error:'prompt es obligatorio'});return send(res,200,{stages:['analyze','plan','build','test','summarize'],plan:['Analizar objetivo y restricciones','Diseñar cambios mínimos necesarios','Construir en el workspace','Ejecutar validaciones','Resumir resultados y próximos pasos'],prompt:input.prompt.trim()});}catch(error){return send(res,400,{error:error.message || 'Petición inválida'});}}
  if(req.url==='/v1/ask'&&req.method==='POST'){try{const input=JSON.parse(await readBody(req));if(!input.provider||!input.prompt?.trim())return send(res,400,{error:'provider y prompt son obligatorios'});return send(res,200,await askProvider(input));}catch(error){return send(res,500,{error:error.message || 'Error interno'});}}
  return send(res,404,{error:'Not found'});
});
server.listen(port,'127.0.0.1',()=>console.log('Plataforma AI gateway: http://127.0.0.1:'+port));
