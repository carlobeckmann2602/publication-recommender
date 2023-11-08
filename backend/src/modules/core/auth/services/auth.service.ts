import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/services/user.service';
import { JwtDto } from '../dto/jwt.dto';
import { LoggedIn } from '../dto/logged-in.dto';
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
  public async register(dto: RegisterDto): Promise<LoggedIn> {
    const user = await this.userService.createUser({ ...dto });
    const loggedIn = new LoggedIn();
    loggedIn.jwt = this.tokenService.generateTokens(user.id);
    loggedIn.user = user;

    return loggedIn;
  }

  /**
   * @throws {InvalidCredentialsException}
   */
  public async login(email: string, password: string): Promise<LoggedIn> {
    try {
      const user = await this.userService.getUserByEmail(email);
      const match = bcrypt.compareSync(password, user.password);

      if (match) {
        const loggedIn = new LoggedIn();
        loggedIn.jwt = this.tokenService.generateTokens(user.id);
        loggedIn.user = user;

        return loggedIn;
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
