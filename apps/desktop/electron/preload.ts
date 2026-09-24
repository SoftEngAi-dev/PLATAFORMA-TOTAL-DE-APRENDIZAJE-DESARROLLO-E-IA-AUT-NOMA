import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('desktopApi', {
  health: () => ipcRenderer.invoke('ai:health'),
  plan: (prompt: string) => ipcRenderer.invoke('ai:plan', prompt),
  ask: (request: unknown) => ipcRenderer.invoke('ai:ask', request),
  listProjects: () => ipcRenderer.invoke('workspace:list'),
  createProject: (name: string) => ipcRenderer.invoke('workspace:create', name)
});
