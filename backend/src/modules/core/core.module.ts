import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthResolver } from './auth/resolvers/auth.resolver';
import { AuthService } from './auth/services/auth.service';
import { TokenService } from './auth/services/token.service';
import { Favorite } from './publication/entities/favorite.entity';
import { Publication } from './publication/entities/publication.entity';
import { Recommendation } from './publication/entities/recommendation.entity';
import { FavoriteResolver } from './publication/resolvers/favorite.resolver';
import { PublicationResolver } from './publication/resolvers/publication.resolver';
import { RecommendationResolver } from './publication/resolvers/recommendation.resolver';
import { DescriptorService } from './publication/services/descriptor.service';
import { FavoriteService } from './publication/services/favorites.service';
import { PublicationService } from './publication/services/publication.service';
import { RecommendationService } from './publication/services/recommendation.service';
import { User } from './user/entities/user.entity';
import { UserResolver } from './user/resolvers/user.resolver';
import { UserService } from './user/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Publication, Favorite, Recommendation]),
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
    FavoriteService,
    RecommendationService,
    AuthResolver,
    PublicationResolver,
    FavoriteResolver,
    RecommendationResolver,
    UserResolver,
  ],
  exports: [RecommendationService],
})
export class CoreModule {}
