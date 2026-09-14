import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const catalog = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../../packages/content/src/catalog.json"), "utf8")
);
const curriculum = catalog.courses.flatMap((course) =>
  course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      id: lesson.id,
      courseId: course.id,
      level: course.level,
      title: lesson.title,
      description: module.objective,
      estimatedMinutes: lesson.minutes,
      outcomes: lesson.successCriteria
    }))
  )
);

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
    if (request.method === "GET" && url.pathname === "/api/courses") {
      return sendJson(response, 200, catalog);
    }
    if (request.method === "GET" && url.pathname.startsWith("/api/courses/")) {
      const course = catalog.courses.find((item) => item.id === url.pathname.split("/").pop());
      return course
        ? sendJson(response, 200, course)
        : sendJson(response, 404, { error: "course_not_found" });
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
