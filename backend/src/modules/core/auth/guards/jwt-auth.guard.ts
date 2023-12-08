import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExtractJwt } from 'passport-jwt';
import { UserNotFoundException } from '../../user/exceptions/user-not-found.exception';
import { UserService } from '../../user/services/user.service';
import { TokenInvalidException } from '../exceptions/token-invalid.exception';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const isOptional = !!this.reflector.get<string>('optional', context.getHandler());
    const { req } = ctx.getContext();
    const jwtParser = ExtractJwt.fromAuthHeaderAsBearerToken();
    const token = jwtParser(req);

    try {
      const payload = this.tokenService.verifyAccessToken(token);
      req.authUser = this.userService.getUserById(payload.id);
    } catch (e) {
      if (!isOptional) {
        if (e instanceof TokenInvalidException) {
          throw new UnauthorizedException(null, e.message);
        }
        if (e instanceof UserNotFoundException) {
          throw new NotFoundException(null, e.message);
        }
      }
      req.authUser = null;
    }

    return true;
  }
}
