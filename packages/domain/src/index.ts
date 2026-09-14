export type LearningMode = "online" | "offline" | "hybrid";

export type Platform = "pc" | "web" | "android" | "ios";

export type LearningLevel =
  | "explorer"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional"
  | "architect";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface UserProfile {
  id: string;
  displayName: string;
  language: "es" | "en";
  level: LearningLevel;
  skills: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: LearningLevel;
  estimatedMinutes: number;
  prerequisites: string[];
  outcomes: string[];
}

export interface LearningProgress {
  moduleId: string;
  status: ProgressStatus;
  completedPercent: number;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  goal: string;
  status: "idea" | "learning" | "building" | "completed";
  technologies: string[];
  evidence: string[];
}

export interface SyncOperation {
  id: string;
  entity: "profile" | "progress" | "project";
  action: "upsert" | "delete";
  payload: unknown;
  createdAt: string;
}
