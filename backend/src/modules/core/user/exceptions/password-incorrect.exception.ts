import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class PasswordIncorrectException extends RuntimeException {
  public static MESSAGE = 'Password is incorrect';
}
