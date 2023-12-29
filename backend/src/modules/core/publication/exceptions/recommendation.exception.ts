export class RecommendationException extends Error {
  constructor(message?: string) {
    super(message ?? 'execption when handling recommendations');
  }
}
