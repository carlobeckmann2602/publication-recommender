import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class UserNotFoundException extends RuntimeException {
  public static MESSAGE = 'User not found';
}
