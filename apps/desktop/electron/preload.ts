import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktopApi', {
  health: () => ipcRenderer.invoke('ai:health'),
  ask: (request: unknown) => ipcRenderer.invoke('ai:ask', request),
});
