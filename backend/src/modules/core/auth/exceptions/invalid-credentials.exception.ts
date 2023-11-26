import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class InvalidCredentialsException extends RuntimeException {
  public static MESSAGE = 'Invalid credentials';
}
