import { UsePipes, ValidationPipe } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { UnprocessableEntityException } from '@nestjs/common/exceptions/unprocessable-entity.exception';
import { Args, Resolver } from '@nestjs/graphql';
import { Mutation } from '@nestjs/graphql/dist/decorators/mutation.decorator';
import { UserNotFoundException } from '../../user/exceptions/user-not-found.exception';
import { JwtDto } from '../dto/jwt.dto';
import { LoggedIn } from '../dto/logged-in.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenInvalidException } from '../exception/token-invalid.exception';
import { AuthService } from '../services/auth.service';

@Resolver(() => JwtDto)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoggedIn)
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Args('data', {
      type: () => RegisterDto,
      nullable: false,
    })
    data: RegisterDto,
  ): Promise<LoggedIn> {
    try {
      return await this.authService.register(data);
    } catch (e) {
      throw new UnprocessableEntityException(null, e.message);
    }
  }

  @Mutation(() => LoggedIn)
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(
    @Args('data', {
      type: () => LoginDto,
      nullable: false,
    })
    data: LoginDto,
  ): Promise<LoggedIn> {
    try {
      return await this.authService.login(data.email, data.password);
    } catch (e) {
      throw new UnauthorizedException(null, e.message);
    }
  }

  @Mutation(() => JwtDto)
  async refreshToken(@Args('token') token: string): Promise<JwtDto> {
    try {
      return await this.authService.refresh(token);
    } catch (e) {
      if (e instanceof TokenInvalidException) {
        throw new UnauthorizedException(null, e.message);
      }

      if (e instanceof UserNotFoundException) {
        throw new NotFoundException(null, e.message);
      }
    }
  }
}
