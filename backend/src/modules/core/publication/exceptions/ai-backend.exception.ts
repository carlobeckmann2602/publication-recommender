export class AiBackendException extends Error {
  constructor(message?: string) {
    super(message ?? 'Bad response from ai backend');
  }
}
