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

test("email account persists session and progress in the local database", async (t) => {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const port = server.address().port;
  const email = `test-${Date.now()}@example.com`;

  const registered = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "email", subject: email, password: "correct-horse", displayName: "Test Learner" })
  });
  assert.equal(registered.status, 201);
  const account = await registered.json();
  assert.equal(account.user.displayName, "Test Learner");
  assert.ok(account.session.token);

  const progress = await fetch(`http://127.0.0.1:${port}/api/progress`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bearer ${account.session.token}` },
    body: JSON.stringify({ lessonId: "python-01-01", status: "completed", completedPercent: 100 })
  });
  assert.equal(progress.status, 200);
  assert.equal((await progress.json()).progress[0].status, "completed");

  const login = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "email", subject: email, password: "correct-horse" })
  });
  assert.equal(login.status, 200);
});

test("phone and social providers remain independent authentication options", async (t) => {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const port = server.address().port;

  const phone = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "phone", subject: `+54911${Date.now().toString().slice(-8)}`, password: "correct-horse" })
  });
  assert.equal(phone.status, 201);

  const social = await fetch(`http://127.0.0.1:${port}/api/auth/social/google`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subject: `google-${Date.now()}`, displayName: "Google Demo" })
  });
  assert.equal(social.status, 200);
  assert.equal((await social.json()).developmentOnly, true);
});
