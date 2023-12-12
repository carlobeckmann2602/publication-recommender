import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../user/entities/user.entity';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { Publication } from '../entities/publication.entity';
import { FavoriteService } from '../services/favorites.service';

@Resolver(() => Publication)
export class FavoriteResolver {
  constructor(private favoriteService: FavoriteService) {}

  @Query(() => [PublicationResponseDto])
  @UseGuards(JwtAuthGuard)
  async favorites(@AuthUser() user: User): Promise<PublicationResponseDto[]> {
    try {
      const favoritePublications = await this.favoriteService.all(user);
      return favoritePublications.map((publication) => {
        const dto = new PublicationResponseDto(publication);
        dto.isFavorite = true;

        return dto;
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markAsFavorite(@AuthUser() user: User, @Args('id') id: string): Promise<boolean> {
    try {
      await this.favoriteService.mark(user, id);

      return true;
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async unmarkAsFavorite(@AuthUser() user: User, @Args('id') id: string): Promise<boolean> {
    try {
      await this.favoriteService.unmark(user, id);

      return true;
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }
}
