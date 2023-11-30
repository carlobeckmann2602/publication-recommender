export class AiBackendException extends Error {
  constructor() {
    super('Bad response from ai backend');
  }
}
