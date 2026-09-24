import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import os from 'node:os';
import { spawn, type ChildProcess } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;
const gateway = process.env.AI_ORCHESTRATOR_URL || 'http://127.0.0.1:8790';
const workspaceRoot = path.resolve(process.env.PLATAFORMA_WORKSPACE || path.join(os.homedir(), 'PlataformaWorkspace'));
const children: ChildProcess[] = [];

function startLocalServices(): void {
  if (!app.isPackaged) return;
  const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
  const gatewayPath = path.join(process.resourcesPath, 'gateway', 'main.mjs');
  const sandboxPath = path.join(process.resourcesPath, 'sandbox', 'main.mjs');
  for (const [script, port] of [[gatewayPath, '8790'], [sandboxPath, '8791']] as const) {
    const child = spawn(process.execPath, [script], { env: { ...env, ...(script === gatewayPath ? { AI_ORCHESTRATOR_PORT: port } : { SANDBOX_PORT: port }) }, stdio: 'ignore', windowsHide: true });
    children.push(child);
  }
}

function stopLocalServices(): void { for (const child of children) child.kill(); }

function safeName(name: string): string {
  const value = name.trim();
  if (!/^[\p{L}\p{N}][\p{L}\p{N} _.-]{1,70}$/u.test(value)) throw new Error('Nombre de proyecto no válido.');
  return value;
}
function projectPath(name: string): string { return path.resolve(workspaceRoot, safeName(name)); }

async function listProjects() {
  await fs.mkdir(workspaceRoot, { recursive: true });
  const entries = await fs.readdir(workspaceRoot, { withFileTypes: true });
  const output: Array<{id:string;name:string;updatedAt:string}> = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const stat = await fs.stat(path.join(workspaceRoot, entry.name));
    output.push({ id: entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: entry.name, updatedAt: stat.mtime.toISOString() });
  }
  return output.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1180,
    minHeight: 760,
    title: 'Plataforma Total Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  if (isDev) void win.loadURL('http://127.0.0.1:5173');
  else void win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }: { url: string }) => { void shell.openExternal(url); return { action: 'deny' }; });
}

async function gatewayRequest(endpoint: string, init?: RequestInit) {
  const response = await fetch(gateway + endpoint, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error del gateway.');
  return data;
}

ipcMain.handle('ai:health', async () => {
  try { return await gatewayRequest('/health'); }
  catch { return { ok: false, providers: [], ollamaReachable: false, workspaceRoot, error: 'Gateway no iniciado.' }; }
});
ipcMain.handle('ai:plan', async (_event: unknown, prompt: string) => gatewayRequest('/v1/plan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt }) }));
ipcMain.handle('ai:ask', async (_event: unknown, request: unknown) => gatewayRequest('/v1/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request) }));
ipcMain.handle('workspace:list', async () => listProjects());
ipcMain.handle('workspace:create', async (_event: unknown, name: string) => {
  const clean = safeName(name);
  const root = projectPath(clean);
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(path.join(root, 'README.md'), '# ' + clean + '\n\nProyecto creado por Plataforma Total Studio.\n', 'utf8');
  const stat = await fs.stat(root);
  return { id: clean.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: clean, updatedAt: stat.mtime.toISOString() };
});

app.whenReady().then(() => {
  startLocalServices();
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('before-quit', () => stopLocalServices());
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });