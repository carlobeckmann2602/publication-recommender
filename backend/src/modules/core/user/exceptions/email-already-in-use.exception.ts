import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class EmailAlreadyInUseException extends RuntimeException {
  public static MESSAGE = 'The email address is already in use by another account.';
}
