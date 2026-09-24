export type ProviderId = 'ollama' | 'openai' | 'anthropic' | 'github';
export type AgentStage = 'analyze' | 'plan' | 'build' | 'test' | 'summarize';

export interface ChatRequest {
  prompt: string;
  provider: ProviderId;
  model?: string;
  projectId?: string;
  system?: string;
}
export interface ChatResponse {
  provider: ProviderId;
  model?: string;
  text: string;
}
export interface WorkspaceProject {
  id: string;
  name: string;
  root?: string;
  updatedAt: string;
}
