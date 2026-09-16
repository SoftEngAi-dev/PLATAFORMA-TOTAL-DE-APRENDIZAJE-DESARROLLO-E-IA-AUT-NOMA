# Integraciones locales con IA y repositorios

Este servicio es una puerta de enlace **local**. Las claves nunca deben ir al renderer ni al repositorio: se leen desde variables de entorno del equipo.

## Proveedores

- `openai`: API oficial de OpenAI/ChatGPT.
- `anthropic`: API oficial de Anthropic/Claude.
- `arena`: adaptador genérico opcional; no automatiza la web ni evita controles de Arena. Solo se activa con un endpoint/API oficial autorizado (`ARENA_API_URL`).
- `github`: lectura de metadatos de repositorios mediante la API oficial de GitHub.

No se deben automatizar las interfaces web de ChatGPT, Claude o Arena con scraping, cookies o credenciales del navegador. Para esos servicios se usan sus APIs oficiales y sus términos de uso.

## Uso local

```bash
cp .env.example .env
# completa solo las claves de los proveedores que usarás
npm --workspace @plataforma/ai-orchestrator run start
```

`GET http://127.0.0.1:8790/health`

`POST http://127.0.0.1:8790/v1/ask`

```json
{"provider":"openai","prompt":"Diseña la arquitectura del módulo offline","model":"gpt-4.1-mini"}
```
