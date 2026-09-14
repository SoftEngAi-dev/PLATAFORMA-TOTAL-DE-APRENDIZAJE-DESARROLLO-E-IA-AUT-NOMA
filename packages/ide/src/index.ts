export type IdeMode = "learning" | "assisted" | "professional" | "expert" | "exam";

export interface CodeExecutionRequest {
  language: "javascript" | "typescript" | "python";
  source: string;
}

export interface CodeExecutionResult {
  status: "queued" | "completed" | "rejected";
  output: string;
  explanation?: string;
}

export function validateExecutionRequest(
  request: CodeExecutionRequest
): CodeExecutionResult {
  if (!request.source.trim()) {
    return { status: "rejected", output: "El código no puede estar vacío." };
  }
  return {
    status: "queued",
    output: "Ejecución aislada pendiente de un runner seguro."
  };
}
