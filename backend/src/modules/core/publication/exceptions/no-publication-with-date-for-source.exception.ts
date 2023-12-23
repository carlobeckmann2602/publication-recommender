export class NoPublicationWithDateForSourceException extends Error {
  constructor() {
    super('No publication with a non null date value for given source');
  }
}
