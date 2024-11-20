import { HttpException, HttpStatus } from '@nestjs/common';

export class PublicationGroupForbiddenException extends HttpException {
  constructor(message?: string) {
    super(message ?? 'Access to the publication group is denied to the current user', HttpStatus.FORBIDDEN);
  }
}
