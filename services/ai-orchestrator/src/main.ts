import { createServer } from 'node:http';
import { askProvider, configuredProviders, type ChatRequest } from './providers.ts';

const port = Number(process.env.AI_ORCHESTRATOR_PORT || 8790);
const allowedOrigin = process.env.AI_ALLOWED_ORIGIN || 'http://localhost:5173';

function json(response: any, status: number, data: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': allowedOrigin, 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS' });
  response.end(JSON.stringify(data));
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return json(response, 204, {});
  if (request.url === '/health' && request.method === 'GET') return json(response, 200, { ok: true, providers: configuredProviders() });
  if (request.url !== '/v1/ask' || request.method !== 'POST') return json(response, 404, { error: 'Not found' });
  try {
    const body = await new Promise<string>((resolve, reject) => { let value = ''; request.on('data', chunk => value += chunk); request.on('end', () => resolve(value)); request.on('error', reject); });
    const input = JSON.parse(body) as ChatRequest;
    if (!input.provider || !input.prompt) return json(response, 400, { error: 'provider y prompt son obligatorios' });
    return json(response, 200, await askProvider(input));
  } catch (error) {
    return json(response, 500, { error: error instanceof Error ? error.message : 'Error interno' });
  }
});

server.listen(port, '127.0.0.1', () => console.log(`AI orchestrator local escuchando en http://127.0.0.1:${port}`));
