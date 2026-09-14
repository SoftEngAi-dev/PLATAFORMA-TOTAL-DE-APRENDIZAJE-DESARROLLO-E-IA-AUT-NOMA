import { createServer } from "node:http";

const curriculum = [
  {
    id: "computational-thinking",
    level: "explorer",
    title: "Pensamiento computacional",
    description: "Divide problemas reales en pasos, datos y decisiones.",
    estimatedMinutes: 45,
    outcomes: ["Descomponer un problema", "Escribir un algoritmo"]
  },
  {
    id: "python-foundations",
    level: "beginner",
    title: "Fundamentos de Python",
    description: "Variables, condiciones, ciclos, funciones y errores.",
    estimatedMinutes: 120,
    outcomes: ["Crear scripts", "Depurar errores básicos"]
  },
  {
    id: "apis-and-data",
    level: "intermediate",
    title: "APIs y datos",
    description: "Conecta servicios y persiste información con contratos claros.",
    estimatedMinutes: 180,
    outcomes: ["Consumir una API", "Modelar datos"]
  }
];

const profiles = new Map([
  [
    "demo-user",
    {
      id: "demo-user",
      displayName: "Explorador",
      language: "es",
      level: "explorer",
      skills: [],
      progress: []
    }
  ]
]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,PUT,OPTIONS"
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createApiServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (request.method === "OPTIONS") return sendJson(response, 204, {});

    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, { status: "ok", service: "totalai-api", version: "0.1.0" });
    }
    if (request.method === "GET" && url.pathname === "/api/curriculum") {
      return sendJson(response, 200, { items: curriculum });
    }
    if (url.pathname.startsWith("/api/profiles/")) {
      const id = url.pathname.split("/").pop();
      if (!id) return sendJson(response, 400, { error: "profile_id_required" });
      if (request.method === "GET") {
        const profile = profiles.get(id);
        return profile
          ? sendJson(response, 200, profile)
          : sendJson(response, 404, { error: "profile_not_found" });
      }
      if (request.method === "PUT") {
        const body = await readBody(request);
        if (!body || typeof body !== "object") {
          return sendJson(response, 400, { error: "invalid_json" });
        }
        const current = profiles.get(id) ?? { id, progress: [], skills: [] };
        const updated = { ...current, ...body, id, progress: body.progress ?? current.progress };
        profiles.set(id, updated);
        return sendJson(response, 200, updated);
      }
    }
    if (request.method === "POST" && url.pathname === "/api/tutor") {
      const body = await readBody(request);
      const question = typeof body?.question === "string" ? body.question.trim() : "";
      if (!question) return sendJson(response, 400, { error: "question_required" });
      return sendJson(response, 200, {
        explanation: `Divide el problema en entrada, transformación y salida. Pregunta: "${question}".`,
        nextStep: "Escribe un ejemplo pequeño y comprueba el resultado.",
        requiresHumanReview: false
      });
    }
    return sendJson(response, 404, { error: "route_not_found" });
  });
}
