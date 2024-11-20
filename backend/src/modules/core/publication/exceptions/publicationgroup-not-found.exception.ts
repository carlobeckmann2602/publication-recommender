import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class PublicationGroupNotFoundException extends RuntimeException {
  constructor(message?: string) {
    super(message ?? 'Publicationgroup not found');
  }
}
