export {};

declare global {
  interface Window {
    desktopApi: {
      health: () => Promise<{ ok: boolean; providers: string[]; ollamaReachable: boolean; workspaceRoot: string; error?: string }>;
      ask: (request: unknown) => Promise<{ text: string; provider: string; model?: string }>;
      plan: (prompt: string) => Promise<{ stages: string[]; plan: string[] }>;
      listProjects: () => Promise<Array<{ id: string; name: string; updatedAt: string }>>;
      createProject: (name: string) => Promise<{ id: string; name: string; updatedAt: string }>;
    };
  }
}
