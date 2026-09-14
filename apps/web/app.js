const modules = [
  ["explorer", "Pensamiento computacional", "Divide problemas reales en pasos, datos y decisiones.", "45 minutos"],
  ["beginner", "Fundamentos de Python", "Variables, condiciones, ciclos, funciones y errores.", "120 minutos"],
  ["intermediate", "APIs y datos", "Conecta servicios y persiste información con contratos claros.", "180 minutos"]
];

const curriculum = document.querySelector("#curriculum");
curriculum.innerHTML = modules.map(([level, title, description, duration], index) => `
  <article class="module ${index === 0 ? "is-next" : ""}">
    <span class="level">${level}</span>
    <h3>${title}</h3>
    <p>${description}</p>
    <small>${duration} · Ruta recomendada</small>
  </article>
`).join("");
