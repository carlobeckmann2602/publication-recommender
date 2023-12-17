import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { JwtDto } from '../dto/jwt.dto';
import { PayloadDto } from '../dto/payload.dto';
import { TokenInvalidException } from '../exceptions/token-invalid.exception';

@Injectable()
export class TokenService {
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenTtl = parseInt(this.configService.get('JWT_ACCESS_TOKEN_TTL'), 10);
    this.refreshTokenTtl = parseInt(this.configService.get('JWT_REFRESH_TOKEN_TTL'), 10);
  }

  generateAccessToken(id: string): string {
    const payload = new PayloadDto(id);
    return this.jwtService.sign(instanceToPlain(payload), {
      expiresIn: this.accessTokenTtl,
    });
  }

  generateRefreshToken(id: string): string {
    const payload = new PayloadDto(id, true);
    return this.jwtService.sign(instanceToPlain(payload), {
      expiresIn: this.refreshTokenTtl,
    });
  }

  /**
   * @throws {TokenInvalidException}
   */
  verify(token: string): PayloadDto {
    try {
      const data = this.jwtService.verify(token);
      const payload: any = plainToInstance<PayloadDto, any>(PayloadDto, data, { excludeExtraneousValues: true });

      if (payload instanceof PayloadDto) {
        return payload;
      }
    } catch (e) {
      throw new TokenInvalidException(TokenInvalidException.MESSAGE);
    }

    throw new TokenInvalidException(TokenInvalidException.MESSAGE);
  }

  /**
   * @throws {TokenInvalidException}
   */
  verifyAccessToken(token: string): PayloadDto {
    const payload = this.verify(token);

    if (payload.isRefreshToken) {
      throw new TokenInvalidException(TokenInvalidException.MESSAGE);
    }

    return payload;
  }

  /**
   * @throws {TokenInvalidException}
   */
  verifyRefreshToken(token: string): PayloadDto {
    const payload = this.verify(token);

    if (!payload.isRefreshToken) {
      throw new TokenInvalidException(TokenInvalidException.MESSAGE);
    }

    return payload;
  }

  generateTokens(id: string): JwtDto {
    const accessToken = this.generateAccessToken(id);
    const refreshToken = this.generateRefreshToken(id);

    return new JwtDto(accessToken, refreshToken, this.accessTokenTtl);
  }
}
