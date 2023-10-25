import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication } from '../entities/publication.entity';
import PublicationsQueryDto from '../dto/publications-query.dto';

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

  async findOne(id: string): Promise<Publication> {
    return this.publicationRepository.findOneBy({ id });
  }
}
