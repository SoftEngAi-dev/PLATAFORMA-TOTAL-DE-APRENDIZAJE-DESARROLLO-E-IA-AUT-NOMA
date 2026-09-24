declare module 'react' { export function useState<T>(initial:T):[T,(v:T|((p:T)=>T))=>void]; export function useEffect(f:()=>void|(()=>void),d?:any[]):void; export function useMemo<T>(f:()=>T,d:any[]):T; const React:any; export default React; }
declare module 'react/jsx-runtime' { export const jsx:any; export const jsxs:any; export const Fragment:any; }
declare module 'react-dom/client' { export const createRoot:any; }
declare module '@xyflow/react' { export type Node=any; export type Edge=any; export const Background:any; export const Controls:any; export const MiniMap:any; export const ReactFlow:any; export const ReactFlowProvider:any; }
declare module 'lucide-react' { export const Activity:any,Bot:any,BrainCircuit:any,CheckCircle2:any,ChevronRight:any,Code2:any,FolderOpen:any,GitBranch:any,PanelLeft:any,Plus:any,Send:any,Settings2:any,ShieldCheck:any,TerminalSquare:any,Workflow:any,X:any; }
declare module 'vite' { export function defineConfig(x:any):any; }
declare module '@vitejs/plugin-react' { const x:any; export default x; }
declare module 'electron' { export const app:any,BrowserWindow:any,ipcMain:any,shell:any,contextBridge:any,ipcRenderer:any; }
declare module 'node:path'; declare module 'node:fs/promises'; declare module 'node:os'; declare module 'node:url'; declare module 'node:child_process' { export const spawn:any; export type ChildProcess=any; }
declare const process:any;
declare namespace JSX { interface IntrinsicElements {[key:string]:any;} }
