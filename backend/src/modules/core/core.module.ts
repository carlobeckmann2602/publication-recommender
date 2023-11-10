import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthResolver } from './auth/resolver/auth.resolver';
import { AuthService } from './auth/services/auth.service';
import { TokenService } from './auth/services/token.service';
import { Publication } from './publication/entities/publication.entity';
import { PublicationResolver } from './publication/resolver/publication.resolver';
import { PublicationService } from './publication/services/publication.service';
import { User } from './user/entities/user.entity';
import { UserService } from './user/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Publication]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {},
      }),
    }),
  ],
  providers: [UserService, AuthService, TokenService, PublicationService, PublicationResolver, AuthResolver],
})
export class CoreModule {}
