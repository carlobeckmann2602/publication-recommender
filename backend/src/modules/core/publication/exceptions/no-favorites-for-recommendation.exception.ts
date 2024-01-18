export class NoFavoritesForRecommendationException extends Error {
  constructor(message?: string) {
    super(message ?? 'Could not generate recommendation. User has no favorites');
  }
}
