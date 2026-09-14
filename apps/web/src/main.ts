import { getNextModule, starterCurriculum } from "@plataforma/learning";
import type { LearningProgress, UserProfile } from "@plataforma/domain";

const profile: UserProfile = {
  id: "demo-user",
  displayName: "Explorador",
  language: "es",
  level: "explorer",
  skills: []
};

const progress: LearningProgress[] = [];

export function bootstrapWebApp(): void {
  const curriculum = document.querySelector<HTMLDivElement>("#curriculum");
  const next = getNextModule(profile, progress);
  if (!curriculum) return;

  curriculum.innerHTML = starterCurriculum
    .map(
      (module) => `
        <article class="module ${module.id === next?.id ? "is-next" : ""}">
          <span class="level">${module.level}</span>
          <h3>${module.title}</h3>
          <p>${module.description}</p>
          <small>${module.estimatedMinutes} minutos · ${module.outcomes.join(" · ")}</small>
        </article>`
    )
    .join("");
}

if (typeof document !== "undefined") bootstrapWebApp();
