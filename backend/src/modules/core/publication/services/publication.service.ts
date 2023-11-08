import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PublicationsQueryDto from '../dto/publications-query.dto';
import { Publication } from '../entities/publication.entity';
import { PublicationNotFoundException } from '../exception/publication-not-found.exception';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
  ) {}

  async findAll(query?: PublicationsQueryDto): Promise<Publication[]> {
    const dbQuery = this.publicationRepository.createQueryBuilder('publications');

    if (query) {
      if (query.title) {
        dbQuery.andWhere(`publications.title LIKE :title`, {
          title: `${query.title}%`,
        });
      }

      if (query.publisher) {
        dbQuery.andWhere(`publications.publisher LIKE :publisher`, {
          publisher: `${query.publisher}%`,
        });
      }
    }

    return await dbQuery.getMany();
  }

  /**
   * @throws {PublicationNotFoundException}
   */
  async findOne(id: string): Promise<Publication> {
    const publication = await this.publicationRepository.findOneBy({ id });

    if (!publication) {
      throw new PublicationNotFoundException(PublicationNotFoundException.MESSAGE);
    }

    return publication;
  }
}
