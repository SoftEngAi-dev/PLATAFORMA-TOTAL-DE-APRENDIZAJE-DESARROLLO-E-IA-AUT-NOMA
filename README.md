# Plataforma Total Studio

Aplicación de escritorio local-first para aprender y crear software con agentes de IA. La experiencia central combina **chat + orquestación + canvas visual + workspace de archivos + validación + sandbox**.

## Qué está construido

- **Desktop seguro:** Electron + React + Vite + TypeScript; \`contextIsolation\`, \`sandbox\` y \`nodeIntegration=false\`.
- **Gateway local:** API en \`127.0.0.1:8790\` para aislar credenciales y proveedores.
- **IA local:** Ollama como primera opción; OpenAI/Anthropic como proveedores opcionales.
- **Agente:** ciclo explícito \`analyze → plan → build → test → summarize\`.
- **Canvas:** React Flow para visualizar el estado del agente.
- **Workspace:** proyectos locales dentro de una carpeta controlada, con validación de nombres.
- **Sandbox:** servicio separado preparado para ejecución Docker sin red y con límites de recursos.
- **Tests:** pruebas unitarias de contrato y seguridad.

## Arranque

\`\`\`bash
cp .env.example .env
npm install
npm run dev
\`\`\`

\`npm run dev\` levanta el gateway local y la aplicación desktop. Ollama es opcional: la interfaz muestra claramente su estado y permite conectar un proveedor cloud cuando esté configurado.

## Arquitectura

\`\`\`text
Electron Desktop
  ├─ Chat / Agent
  ├─ Canvas visual
  ├─ Files / Projects
  └─ Activity / Validation
          │ IPC seguro
          ▼
Local AI Gateway 127.0.0.1:8790
          ├── Ollama
          ├── OpenAI
          └── Anthropic
          │
          ▼
       Agent Core
          │
          ▼
  Sandbox Docker 127.0.0.1:8791
\`\`\`

## Principios

1. Las claves viven fuera del renderer.
2. El proyecto del usuario es una carpeta de archivos normales.
3. La inferencia puede ser local y sin coste por token mediante Ollama.
4. Cada tarea tiene un ciclo explícito de análisis, planificación y validación.
5. La ejecución de código queda separada de la interfaz y preparada para aislamiento.

## Verificación

\`\`\`bash
npm test
npm run typecheck
\`\`\`

El proyecto incluye verificaciones estructurales que pueden ejecutarse incluso antes de instalar las dependencias de UI.
