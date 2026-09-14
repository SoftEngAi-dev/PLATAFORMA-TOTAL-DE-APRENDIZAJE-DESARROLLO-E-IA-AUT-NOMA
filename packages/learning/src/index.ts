import type {
  LearningModule,
  LearningProgress,
  UserProfile
} from "@plataforma/domain";

export const starterCurriculum: LearningModule[] = [
  {
    id: "computational-thinking",
    title: "Pensamiento computacional",
    description: "Divide problemas reales en pasos, datos y decisiones.",
    level: "explorer",
    estimatedMinutes: 45,
    prerequisites: [],
    outcomes: ["Descomponer un problema", "Escribir un algoritmo"]
  },
  {
    id: "python-foundations",
    title: "Fundamentos de Python",
    description: "Variables, condiciones, ciclos, funciones y errores.",
    level: "beginner",
    estimatedMinutes: 120,
    prerequisites: ["computational-thinking"],
    outcomes: ["Crear scripts", "Depurar errores básicos"]
  },
  {
    id: "apis-and-data",
    title: "APIs y datos",
    description: "Conecta servicios y persiste información con contratos claros.",
    level: "intermediate",
    estimatedMinutes: 180,
    prerequisites: ["python-foundations"],
    outcomes: ["Consumir una API", "Modelar datos"]
  }
];

export function getNextModule(
  profile: UserProfile,
  progress: LearningProgress[]
): LearningModule | undefined {
  const completed = new Set(
    progress.filter((item) => item.status === "completed").map((item) => item.moduleId)
  );

  return starterCurriculum.find(
    (module) =>
      module.level === profile.level &&
      !completed.has(module.id) &&
      module.prerequisites.every((id) => completed.has(id))
  );
}
