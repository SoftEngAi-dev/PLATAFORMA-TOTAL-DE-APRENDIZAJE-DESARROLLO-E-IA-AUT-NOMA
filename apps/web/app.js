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
      </article>`;
  }).join("");
  const status = document.querySelector(".status");
  if (status) status.textContent = connected ? "● API conectada" : "● Modo offline";
}

renderModules(fallbackModules, false);

const apiUrl = window.TOTALAI_API_URL ?? "http://127.0.0.1:8787";
fetch(`${apiUrl}/api/curriculum`)
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("API unavailable")))
  .then((payload) => renderModules(payload.items, true))
  .catch(() => renderModules(fallbackModules, false));
