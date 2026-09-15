import { createApiServer } from "./server.mjs";

const port = Number(process.env.PORT ?? 8787);
createApiServer().listen(port, "127.0.0.1", () => {
  console.log(`TotalAI API listening on http://127.0.0.1:${port}`);
});
