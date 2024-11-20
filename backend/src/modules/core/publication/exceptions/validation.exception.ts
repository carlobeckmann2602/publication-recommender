export class ValidationException extends Error {
  constructor(message?: string) {
    super(message ?? 'error while validating data');
  }
}
