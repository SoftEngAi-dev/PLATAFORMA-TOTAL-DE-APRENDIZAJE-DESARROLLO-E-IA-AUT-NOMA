export interface TutorRequest {
  question: string;
  context: string[];
  language: "es" | "en";
}

export interface TutorResponse {
  explanation: string;
  nextStep: string;
  requiresHumanReview: boolean;
}

export interface TutorProvider {
  answer(request: TutorRequest): Promise<TutorResponse>;
}

export class DeterministicTutor implements TutorProvider {
  async answer(request: TutorRequest): Promise<TutorResponse> {
    const question = request.question.trim();
    if (!question) {
      return {
        explanation: "Formula una pregunta concreta sobre el problema que estás resolviendo.",
        nextStep: "Describe qué intentaste y qué resultado obtuviste.",
        requiresHumanReview: false
      };
    }

    return {
      explanation: `Primero divide el problema en una entrada, una transformación y una salida. Tu pregunta es: "${question}".`,
      nextStep: "Escribe un ejemplo pequeño y comprueba el resultado antes de generalizar.",
      requiresHumanReview: false
    };
  }
}
