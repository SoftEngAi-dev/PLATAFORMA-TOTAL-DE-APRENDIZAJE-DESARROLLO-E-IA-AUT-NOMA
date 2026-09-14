# ADR-0001: Monorepo modular como estructura inicial

## Estado

Aceptada

## Decisión

La primera estructura usa un monorepo TypeScript con aplicaciones, servicios y
paquetes independientes por contexto.

## Motivo

Permite iniciar en blanco, compartir contratos y UI, mantener límites claros y
evolucionar desde el MVP hacia capacidades offline, multiagente y cloud sin
acoplar las aplicaciones al backend.

