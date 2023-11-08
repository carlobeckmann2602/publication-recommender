import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class UnauthorizedException extends RuntimeException {
  public static MESSAGE = 'Unauthorized';
}
