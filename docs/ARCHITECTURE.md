# Arquitectura

La interfaz no ejecuta herramientas del sistema. Toda operación sensible pasa por el proceso principal de Electron o por servicios locales en loopback.

## Agent loop

\`analyze → plan → build → test → summarize\`

La primera implementación mantiene la planificación explícita y delega la inferencia al proveedor elegido. Esto permite sustituir el modelo sin acoplar la UI a un proveedor.

## Seguridad

- Renderer sin acceso Node.
- IPC reducido a acciones necesarias.
- Workspace bajo una raíz controlada.
- Validación de nombres de proyecto.
- Sandbox separado para ejecución.
- Docker sin red, root filesystem de solo lectura y límites de CPU/memoria/PIDs.
