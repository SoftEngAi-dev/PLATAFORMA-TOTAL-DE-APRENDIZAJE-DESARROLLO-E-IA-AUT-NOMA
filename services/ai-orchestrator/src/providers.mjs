const env = name => process.env[name]?.trim() || undefined;
const json = async response => {
  const body = await response.text();
  let data = {};
  try { data = body ? JSON.parse(body) : {}; } catch { data = { raw: body }; }
  if (!response.ok) throw new Error(response.status + ' ' + response.statusText + ': ' + JSON.stringify(data));
  return data;
};
async function ollama(request) {
  const model = request.model || env('OLLAMA_MODEL') || 'qwen2.5-coder:7b';
  const base = env('OLLAMA_BASE_URL') || 'http://127.0.0.1:11434';
  const response = await fetch(base + '/api/chat', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({model,stream:false,messages:[...(request.system?[{role:'system',content:request.system}]:[]),{role:'user',content:request.prompt}]}) });
  const data = await json(response);
  return { provider:'ollama', model, text:data.message?.content || '' };
}
async function openai(request) {
  const key=env('OPENAI_API_KEY'); if(!key) throw new Error('OPENAI_API_KEY no está configurada.');
  const model=request.model || env('OPENAI_MODEL') || 'gpt-4.1-mini';
  const response=await fetch(env('OPENAI_BASE_URL') || 'https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({model,instructions:request.system,input:request.prompt})});
  const data=await json(response); return {provider:'openai',model,text:data.output_text || ''};
}
async function anthropic(request) {
  const key=env('ANTHROPIC_API_KEY'); if(!key) throw new Error('ANTHROPIC_API_KEY no está configurada.');
  const model=request.model || env('ANTHROPIC_MODEL') || 'claude-3-5-haiku-latest';
  const response=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model,max_tokens:4096,system:request.system,messages:[{role:'user',content:request.prompt}]})});
  const data=await json(response); return {provider:'anthropic',model,text:data.content?.map(x=>x.text || '').join('') || ''};
}
async function github(request) {
  const token=env('GITHUB_TOKEN'); if(!token) throw new Error('GITHUB_TOKEN no está configurado.');
  const repo=request.projectId || env('GITHUB_DEFAULT_OWNER');
  if(!repo || !/^[^/]+\/[^/]+$/.test(repo)) throw new Error('Repositorio inválido. Usa owner/repo.');
  const response=await fetch('https://api.github.com/repos/'+repo,{headers:{authorization:'Bearer '+token,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28'}});
  const data=await json(response); return {provider:'github',text:data.full_name+' · '+(data.description || 'sin descripción')+'\n'+data.html_url};
}
export function configuredProviders(){return ['ollama',...(env('OPENAI_API_KEY')?['openai']:[]),...(env('ANTHROPIC_API_KEY')?['anthropic']:[]),...(env('GITHUB_TOKEN')?['github']:[])];}
export async function checkOllama(){try{const base=env('OLLAMA_BASE_URL') || 'http://127.0.0.1:11434';return (await fetch(base+'/api/tags')).ok;}catch{return false;}}
export async function askProvider(request){switch(request.provider){case'ollama':return ollama(request);case'openai':return openai(request);case'anthropic':return anthropic(request);case'github':return github(request);default:throw new Error('Proveedor no soportado: '+request.provider);}}
