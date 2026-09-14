# API

Servicio backend para identidad, catálogo, progreso, sincronización y
orquestación de integraciones.

## Autenticación del MVP

Las credenciales de correo y teléfono son métodos separados: cada identidad
puede registrarse o iniciar sesión con uno u otro. Google, GitHub, Facebook y X
están modelados como proveedores separados mediante
`/api/auth/social/:provider`. En `AUTH_MODE=development` permiten probar el
flujo con un `subject` simulado; en producción deben conectarse a OAuth/OIDC
con secretos de entorno, nunca desde el navegador ni desde el repositorio.

La base local SQLite se crea en `.data/totalai.sqlite` y guarda usuarios,
identidades, sesiones y progreso. `.data` está excluido de Git.
