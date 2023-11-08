import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class PublicationNotFoundException extends RuntimeException {
  public static MESSAGE = 'Publication not found';
}
