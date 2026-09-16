export type ProviderId = 'openai' | 'anthropic' | 'arena' | 'github';

export interface ChatRequest {
  provider: ProviderId;
  prompt: string;
  model?: string;
  system?: string;
  repository?: string;
}

export interface ChatResponse {
  provider: ProviderId;
  model?: string;
  text: string;
  raw?: unknown;
}

const env = (name: string): string | undefined => process.env[name]?.trim() || undefined;

async function readJson(response: Response): Promise<any> {
  const body = await response.text();
  let parsed: any;
  try { parsed = body ? JSON.parse(body) : {}; } catch { parsed = { raw: body }; }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(parsed)}`);
  }
  return parsed;
}

async function openai(request: ChatRequest): Promise<ChatResponse> {
  const key = env('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY no está configurada.');
  const model = request.model || env('OPENAI_MODEL') || 'gpt-4.1-mini';
  const response = await fetch(env('OPENAI_BASE_URL') || 'https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, instructions: request.system, input: request.prompt }),
  });
  const data = await readJson(response);
  return { provider: 'openai', model, text: data.output_text || data.output?.flatMap((item: any) => item.content || []).map((item: any) => item.text || '').join('') || '', raw: data };
}

async function anthropic(request: ChatRequest): Promise<ChatResponse> {
  const key = env('ANTHROPIC_API_KEY');
  if (!key) throw new Error('ANTHROPIC_API_KEY no está configurada.');
  const model = request.model || env('ANTHROPIC_MODEL') || 'claude-3-5-haiku-latest';
  const response = await fetch(env('ANTHROPIC_BASE_URL') || 'https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 4096, system: request.system, messages: [{ role: 'user', content: request.prompt }] }),
  });
  const data = await readJson(response);
  return { provider: 'anthropic', model, text: data.content?.map((item: any) => item.text || '').join('') || '', raw: data };
}

async function arena(request: ChatRequest): Promise<ChatResponse> {
  const endpoint = env('ARENA_API_URL');
  const key = env('ARENA_API_KEY');
  if (!endpoint) throw new Error('Arena no tiene un API público configurado. Define ARENA_API_URL solo si tienes acceso oficial.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { ...(key ? { authorization: `Bearer ${key}` } : {}), 'content-type': 'application/json' },
    body: JSON.stringify({ model: request.model || env('ARENA_MODEL'), prompt: request.prompt, system: request.system }),
  });
  const data = await readJson(response);
  return { provider: 'arena', model: data.model || request.model, text: data.output_text || data.text || data.choices?.[0]?.message?.content || '', raw: data };
}

async function github(request: ChatRequest): Promise<ChatResponse> {
  const token = env('GITHUB_TOKEN');
  if (!token) throw new Error('GITHUB_TOKEN no está configurado.');
  if (!request.repository) throw new Error('repository es obligatorio para el proveedor GitHub.');
  const response = await fetch(`https://api.github.com/repos/${request.repository}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
  });
  const data = await readJson(response);
  return { provider: 'github', text: `Repositorio ${data.full_name}: ${data.description || 'sin descripción'} (${data.html_url})`, raw: data };
}

export function configuredProviders(): ProviderId[] {
  return [
    ...(env('OPENAI_API_KEY') ? ['openai' as const] : []),
    ...(env('ANTHROPIC_API_KEY') ? ['anthropic' as const] : []),
    ...(env('ARENA_API_URL') ? ['arena' as const] : []),
    ...(env('GITHUB_TOKEN') ? ['github' as const] : []),
  ];
}

export async function askProvider(request: ChatRequest): Promise<ChatResponse> {
  switch (request.provider) {
    case 'openai': return openai(request);
    case 'anthropic': return anthropic(request);
    case 'arena': return arena(request);
    case 'github': return github(request);
    default: throw new Error(`Proveedor no soportado: ${request.provider}`);
  }
}
