import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../user/entities/user.entity';
import { RecommendationResponseDto } from '../dto/recommendation-response.dto';
import { FavoriteService } from '../services/favorites.service';
import { RecommendationService } from '../services/recommendation.service';

@Resolver()
export class RecommendationResolver {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly favoriteService: FavoriteService,
  ) {}

  @Query(() => [RecommendationResponseDto])
  @UseGuards(JwtAuthGuard)
  async recommendations(@AuthUser() user: User): Promise<RecommendationResponseDto[]> {
    try {
      const favorites: Set<string> = user
        ? new Set((await this.favoriteService.all(user)).map((publication) => publication.id))
        : new Set([]);

      return (await this.recommendationService.all(user)).map((recommendation) => {
        const dto = new RecommendationResponseDto(recommendation);
        dto.publications.forEach((publication) => {
          if (favorites.has(publication.id)) {
            publication.isFavorite = true;
          }
        });

        return dto;
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
