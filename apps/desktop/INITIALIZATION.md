# Inicialización de la aplicación desktop

## Estado inicial

La aplicación de PC se inicializa con Electron, React, Vite y TypeScript. Este documento sirve como checklist operativo para pasar de la estructura del repositorio a una ejecución local.

## 1. Requisitos

- Node.js `>=20`.
- npm con soporte para workspaces.
- Dependencias instaladas con `npm install`.
- Credenciales de APIs guardadas localmente en `.env`, nunca en Git.

## 2. Configuración

Copia el archivo de ejemplo desde la raíz:

```bash
cp .env.example .env
```

Configura solo los proveedores que utilizarás:

```dotenv
AI_ORCHESTRATOR_PORT=8790
AI_ALLOWED_ORIGIN=http://localhost:5173
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ARENA_API_URL=
ARENA_API_KEY=
GITHUB_TOKEN=
```

## 3. Arranque en modo inicialización

Terminal 1 — gateway local:

```bash
npm --workspace @plataforma/ai-orchestrator run start
```

Terminal 2 — aplicación desktop:

```bash
npm --workspace @plataforma/desktop run dev
```

La ventana de Electron se conectará a la interfaz local de Vite y utilizará IPC seguro para comunicarse con el gateway.

## 4. Verificación

Comprobar el gateway:

```bash
curl http://127.0.0.1:8790/health
```

Comprobar tipos y compilación:

```bash
npm --workspace @plataforma/desktop run type-check
npm --workspace @plataforma/desktop run build
```

## 5. Generación de instaladores

```bash
npm --workspace @plataforma/desktop run dist
```

Salida esperada: `apps/desktop/dist/`.

## 6. Criterios de seguridad

- No poner tokens en `src/`, `App.tsx`, `preload.ts` ni archivos versionados.
- No usar automatización de navegador para servicios de terceros.
- Mantener `contextIsolation`, `sandbox` y `nodeIntegration: false`.
- Escuchar el gateway únicamente en `127.0.0.1` durante el modo local.
- Validar y limitar las peticiones antes de convertir esta base en un producto de distribución pública.

## Siguiente fase

1. Ejecutar la instalación y el type-check local.
2. Corregir cualquier incompatibilidad de dependencias.
3. Probar cada proveedor con claves de desarrollo.
4. Añadir persistencia local de proyectos y conversaciones.
5. Firmar los instaladores antes de distribuirlos.
