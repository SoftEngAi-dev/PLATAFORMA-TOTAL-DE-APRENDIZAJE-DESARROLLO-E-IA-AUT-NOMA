import test from "node:test";
import assert from "node:assert/strict";
import { createApiServer } from "../../services/api/server.mjs";

test("API exposes health and curriculum endpoints", async (t) => {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const port = server.address().port;

  const health = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");

  const curriculum = await fetch(`http://127.0.0.1:${port}/api/curriculum`);
  assert.equal(curriculum.status, 200);
  assert.equal((await curriculum.json()).items.length, 5);

  const courses = await fetch(`http://127.0.0.1:${port}/api/courses`);
  assert.equal(courses.status, 200);
  assert.equal((await courses.json()).courses.length, 3);
});

test("API tutor rejects empty questions and answers valid questions", async (t) => {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const port = server.address().port;

  const invalid = await fetch(`http://127.0.0.1:${port}/api/tutor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  });
  assert.equal(invalid.status, 400);

  const valid = await fetch(`http://127.0.0.1:${port}/api/tutor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "¿Cómo empiezo?" })
  });
  assert.equal(valid.status, 200);
  assert.match((await valid.json()).explanation, /entrada/);
});
