import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';

const isDev = !app.isPackaged;
const orchestratorUrl = process.env.AI_ORCHESTRATOR_URL || 'http://127.0.0.1:8790';

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Plataforma Total de Aprendizaje',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) void window.loadURL('http://127.0.0.1:5173');
  else void window.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('ai:health', async () => {
  try {
    const response = await fetch(`${orchestratorUrl}/health`);
    return await response.json();
  } catch {
    return { ok: false, providers: [], error: 'El gateway local no está iniciado.' };
  }
});

ipcMain.handle('ai:ask', async (_event, request: unknown) => {
  const response = await fetch(`${orchestratorUrl}/v1/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error del proveedor');
  return data;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
