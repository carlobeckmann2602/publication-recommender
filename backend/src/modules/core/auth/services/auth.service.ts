import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UserService } from '../../user/services/user.service';
import { JwtDto } from '../dto/jwt.dto';
import { RegisterDto } from '../dto/register.dto';
import { InvalidCredentialsException } from '../exception/invalid-credentials.exception';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * @throws {EmailAlreadyExistsException}
   */
  public async register(data: RegisterDto): Promise<JwtDto> {
    const createUserDto = new CreateUserDto();
    createUserDto.email = data.email;
    createUserDto.password = data.password;
    const user = await this.userService.createUser(createUserDto);

    return this.tokenService.generateTokens(user.id);
  }

  /**
   * @throws {InvalidCredentialsException}
   */
  public async login(email: string, password: string): Promise<JwtDto> {
    try {
      const user = await this.userService.getUserByEmail(email);
      const match = bcrypt.compareSync(password, user.password);

      if (match) {
        return this.tokenService.generateTokens(user.id);
      }
    } catch (e) {
      throw new InvalidCredentialsException(InvalidCredentialsException.MESSAGE);
    }

    throw new InvalidCredentialsException(InvalidCredentialsException.MESSAGE);
  }

  /**
   * @throws {TokenInvalidException}
   * @throws {UserNotFoundException}
   */
  public async refresh(refreshToken: string): Promise<JwtDto> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userService.getUserById(payload.id);

    return this.tokenService.generateTokens(user.id);
  }
}
