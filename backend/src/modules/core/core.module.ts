import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthResolver } from './auth/resolvers/auth.resolver';
import { AuthService } from './auth/services/auth.service';
import { TokenService } from './auth/services/token.service';
import { PublicationController } from './publication/controllers/publication.controller';
import { Publication } from './publication/entities/publication.entity';
import { PublicationResolver } from './publication/resolvers/publication.resolver';
import { DescriptorService } from './publication/services/descriptor.service';
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
  providers: [
    UserService,
    AuthService,
    TokenService,
    PublicationService,
    DescriptorService,
    PublicationResolver,
    AuthResolver,
  ],
  controllers: [PublicationController],
})
export class CoreModule {}
