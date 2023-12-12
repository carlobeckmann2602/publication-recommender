import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { Favorite } from '../entities/favorite.entity';
import { Publication } from '../entities/publication.entity';
import { PublicationService } from './publication.service';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private publicationService: PublicationService,
  ) {}

  /**
   * @throws {PublicationNotFoundException}
   */
  async mark(user: User, id: string): Promise<void> {
    const publication = await this.publicationService.findOne(id);
    const favorite = new Favorite();
    favorite.user_id = user.id;
    favorite.publication_id = publication.id;
    await this.favoriteRepository.save(favorite);
  }

  async all(user: User): Promise<Publication[]> {
    const favorites = await this.favoriteRepository.find({
      where: {
        user_id: user.id,
      },
      relations: ['publication'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map((favorite: Favorite) => favorite.publication);
  }

  async unmark(user: User, publicationId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user_id: user.id,
        publication_id: publicationId,
      },
      relations: ['publication'],
    });

    if (favorite instanceof Favorite) {
      await this.favoriteRepository.remove(favorite);
    }
  }

  async publicationsWithFavorites(publications: Publication[], user: User | null) {
    const favorites: Set<string> = user
      ? new Set((await this.all(user)).map((publication) => publication.id))
      : new Set([]);

    return publications.map((publication) => {
      const dto = new PublicationResponseDto(publication);
      if (favorites.has(dto.id)) {
        dto.isFavorite = true;
      }
      return dto;
    });
  }
}
