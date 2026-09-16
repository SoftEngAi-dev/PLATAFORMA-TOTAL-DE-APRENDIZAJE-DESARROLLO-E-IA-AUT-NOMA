export {};

declare global {
  interface Window {
    desktopApi: {
      health: () => Promise<{ ok: boolean; providers: string[]; error?: string }>;
      ask: (request: { provider: string; prompt: string; model?: string; system?: string; repository?: string }) => Promise<{ text: string; provider: string; model?: string }>;
    };
  }
}
