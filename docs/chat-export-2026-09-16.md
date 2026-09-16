# Exportación de conversación — Inicialización de la app de escritorio

- **Repositorio:** `SoftEngAi-dev/PLATAFORMA-TOTAL-DE-APRENDIZAJE-DESARROLLO-E-IA-AUT-NOMA`
- **Fecha:** 2026-09-16
- **Objetivo:** preparar una aplicación de escritorio para PC, totalmente local en su ejecución, con integraciones mediante APIs oficiales.

## Requisitos acordados

1. La aplicación principal será para PC/desktop.
2. La distribución prevista será:
   - Windows: `.exe` y portable.
   - macOS: `.dmg` y `.zip`.
   - Linux: `.AppImage` y `.deb`.
3. Las claves de proveedores no se incluirán en React ni en el repositorio.
4. Las peticiones pasarán por un gateway local en `127.0.0.1:8790`.
5. Se usarán APIs oficiales para OpenAI/ChatGPT, Anthropic/Claude, GitHub y cualquier otro proveedor autorizado.
6. Arena solo se conectará si se dispone de un endpoint/API oficial autorizado; no se automatizarán navegadores, cookies ni scraping.

## Implementación realizada

Se creó la base de Electron + React + Vite con:

- `apps/desktop/electron/main.ts`
- `apps/desktop/electron/preload.ts`
- `apps/desktop/src/App.tsx`
- `apps/desktop/src/main.tsx`
- `apps/desktop/src/styles.css`
- `apps/desktop/index.html`
- `apps/desktop/tsconfig.electron.json`
- `services/ai-orchestrator/src/providers.ts`
- `services/ai-orchestrator/src/main.ts`
- Configuración de proveedores en `.env.example`.

## Flujo local

```text
Aplicación Electron
        |
        | IPC seguro
        v
Gateway local 127.0.0.1:8790
        |
        +--> OpenAI API
        +--> Anthropic API
        +--> Arena API autorizada
        +--> GitHub API
```

## Comandos previstos

```bash
npm install
npm --workspace @plataforma/ai-orchestrator run start
npm --workspace @plataforma/desktop run dev
```

Para producir instaladores:

```bash
npm --workspace @plataforma/desktop run dist
```

## Estado

La inicialización de la aplicación desktop queda registrada en este repositorio. La compilación final debe ejecutarse en un entorno local con Node.js 20 o superior, las dependencias instaladas y las credenciales configuradas únicamente mediante variables de entorno.
