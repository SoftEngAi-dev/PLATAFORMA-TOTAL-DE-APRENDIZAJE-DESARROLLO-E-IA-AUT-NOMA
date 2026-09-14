export interface ApiRoute {
  method: "GET" | "POST" | "PUT";
  path: string;
  description: string;
}

export const apiRoutes: ApiRoute[] = [
  { method: "GET", path: "/health", description: "Estado del servicio" },
  { method: "GET", path: "/api/curriculum", description: "Ruta inicial de aprendizaje" },
  { method: "GET", path: "/api/profiles/:id", description: "Perfil y progreso" },
  { method: "PUT", path: "/api/profiles/:id", description: "Actualizar perfil" },
  { method: "POST", path: "/api/tutor", description: "Explicación guiada" }
];

export function startApi(): void {
  // El runtime HTTP ejecutable vive en server.mjs para no acoplar el MVP a un framework.
}
