# Estructura inicial del proyecto

## Objetivo

La plataforma debe evolucionar desde principiante hasta profesional, con
experiencias para PC, web, Android e iOS y operación online, offline e híbrida.

## Mapa de carpetas

| Ruta | Responsabilidad |
| --- | --- |
| `apps/web` | Experiencia PC/Web |
| `apps/mobile` | Experiencia Android/iOS |
| `services/api` | API y casos de uso del producto |
| `services/sync` | Sincronización y resolución de conflictos |
| `packages/ui` | Sistema visual compartido |
| `packages/domain` | Tipos y reglas de negocio compartidos |
| `packages/config` | Configuración común |
| `docs` | Arquitectura, producto y decisiones |
| `infra` | Despliegue, observabilidad y recursos |
| `tests` | Pruebas de integración y aceptación |

## Convenciones

- TypeScript para lógica compartida y servicios.
- Las aplicaciones dependen de `packages/domain`, nunca al revés.
- El estado local y la sincronización se mantienen separados del dominio.
- Cada decisión arquitectónica relevante se registra en `docs/architecture`.
- `README.md` es inmutable como documento rector: no se elimina ni se
  reemplaza.

