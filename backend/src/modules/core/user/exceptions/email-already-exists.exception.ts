import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class EmailAlreadyExistsException extends RuntimeException {
  public static MESSAGE = 'Email already exists';
}
