import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
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
    favorite.userId = user.id;
    favorite.publicationId = publication.id;
    await this.favoriteRepository.save(favorite);
  }

  async all(user: User): Promise<Publication[]> {
    const favorites = await this.favoriteRepository.find({
      where: {
        userId: user.id,
      },
      relations: ['publication'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map((favorite: Favorite) => favorite.publication);
  }

  async unmark(user: User, publicationId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        userId: user.id,
        publicationId: publicationId,
      },
      relations: ['publication'],
    });

    if (favorite instanceof Favorite) {
      await this.favoriteRepository.remove(favorite);
    }
  }
}
