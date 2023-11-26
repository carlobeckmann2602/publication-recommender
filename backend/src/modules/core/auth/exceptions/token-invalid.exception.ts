import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class TokenInvalidException extends RuntimeException {
  public static MESSAGE = 'Token is invalid';
}
