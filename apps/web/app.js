const fallbackModules = [
  ["explorer", "Pensamiento computacional", "Divide problemas reales en pasos, datos y decisiones.", "45 minutos"],
  ["beginner", "Fundamentos de Python", "Variables, condiciones, ciclos, funciones y errores.", "120 minutos"],
  ["intermediate", "APIs y datos", "Conecta servicios y persiste información con contratos claros.", "180 minutos"]
];

const curriculum = document.querySelector("#curriculum");

function renderModules(modules, connected) {
  curriculum.innerHTML = modules.map((module, index) => {
    const [level, title, description, duration] = Array.isArray(module)
      ? module
      : [module.level, module.title, module.description, `${module.estimatedMinutes} minutos`];
    return `
      <article class="module ${index === 0 ? "is-next" : ""}">
        <span class="level">${level}</span>
        <h3>${title}</h3>
        <p>${description}</p>
        <small>${duration} · Ruta recomendada</small>
        ${Array.isArray(module) ? "" : `<button class="complete-lesson" data-lesson-id="${module.id}">Marcar completada</button>`}
      </article>`;
  }).join("");
  const status = document.querySelector(".status");
  if (status) status.textContent = connected ? "● API conectada" : "● Modo offline";
}

curriculum.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-lesson-id]");
  if (!button) return;
  if (!sessionToken) {
    setAuthStatus("Inicia sesión para guardar tu progreso.");
    document.querySelector("#cuenta")?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  try {
    await apiRequest("/api/progress", {
      method: "PUT",
      body: JSON.stringify({ lessonId: button.dataset.lessonId, status: "completed", completedPercent: 100 })
    });
    button.textContent = "Completada ✓";
    button.disabled = true;
    setAuthStatus("Progreso guardado correctamente en SQLite.");
  } catch (error) {
    setAuthStatus(`No se pudo guardar: ${error.message}`);
  }
});

renderModules(fallbackModules, false);

const apiUrl = window.TOTALAI_API_URL ?? "http://127.0.0.1:8787";
const authStatus = document.querySelector("#auth-status");
const providerSelect = document.querySelector("#auth-provider");
const subjectInput = document.querySelector("#auth-subject");
const authForm = document.querySelector("#auth-form");
let sessionToken = localStorage.getItem("totalai_session");

function setAuthStatus(message) {
  if (authStatus) authStatus.textContent = message;
}

async function apiRequest(path, options = {}) {
  const headers = { "content-type": "application/json", ...(options.headers ?? {}) };
  if (sessionToken) headers.authorization = `Bearer ${sessionToken}`;
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "request_failed");
  return payload;
}

providerSelect?.addEventListener("change", () => {
  const phone = providerSelect.value === "phone";
  document.querySelector("#subject-label").firstChild.textContent = phone ? "Teléfono " : "Correo ";
  subjectInput.placeholder = phone ? "+5491112345678" : "tu@correo.com";
  subjectInput.type = phone ? "tel" : "email";
});

async function finishAuth(payload) {
  sessionToken = payload.session.token;
  localStorage.setItem("totalai_session", sessionToken);
  setAuthStatus(`Sesión activa: ${payload.user.displayName}. Progreso guardado en SQLite.`);
}

authForm?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-auth-action]");
  if (button) authForm.dataset.action = button.dataset.authAction;
});

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const action = authForm.dataset.action ?? "login";
  try {
    const payload = await apiRequest(`/api/auth/${action}`, {
      method: "POST",
      body: JSON.stringify({
        provider: providerSelect.value,
        subject: subjectInput.value,
        password: document.querySelector("#auth-password").value,
        displayName: subjectInput.value.split("@")[0]
      })
    });
    await finishAuth(payload);
  } catch (error) {
    setAuthStatus(`No se pudo completar: ${error.message}`);
  }
});

document.querySelectorAll("[data-social]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      const payload = await apiRequest(`/api/auth/social/${button.dataset.social}`, {
        method: "POST",
        body: JSON.stringify({ subject: `demo-${button.dataset.social}-user`, displayName: `Usuario ${button.dataset.social}` })
      });
      await finishAuth(payload);
    } catch (error) {
      setAuthStatus(`No se pudo iniciar con ${button.dataset.social}: ${error.message}`);
    }
  });
});

if (sessionToken) {
  apiRequest("/api/auth/me").then(({ user }) => setAuthStatus(`Sesión activa: ${user.displayName}.`))
    .catch(() => { localStorage.removeItem("totalai_session"); sessionToken = null; });
}

fetch(`${apiUrl}/api/curriculum`)
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("API unavailable")))
  .then((payload) => renderModules(payload.items, true))
  .catch(() => renderModules(fallbackModules, false));
