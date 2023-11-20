import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { Publication } from '../entities/publication.entity';
import { PublicationNotFoundException } from '../exceptions/publication-not-found.exception';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
  ) {}

  async findAll(query: string): Promise<PublicationResponseDto[]> {
    const modelName = 'arxiv_6k-v2';
    //const result = await (await fetch(`/${modelName}/match_token/${query}`)).json();
    //TODO: get recommendation ids based on string
    const results = [
      { id: 1, sentenceIndex: 1 },
      { id: 2, sentenceIndex: 2 },
      { id: 3, sentenceIndex: 3 },
    ];
    const dbQuery = this.publicationRepository.createQueryBuilder('publications');

    const ids = results.map((result) => result.id);
    const publications = await this.publicationRepository.find({ where: { id: In(ids) } });
    const reponse = publications.map((publication) => {
      const sentenceIndex = results.find((result) => result.id === publication.id)?.sentenceIndex;
      if (!sentenceIndex) {
        throw new PublicationNotFoundException();
      }
      return new PublicationResponseDto(publication, sentenceIndex);
    });

    /*   dbQuery.andWhere(`publications.id in :ids`, {
      ids: ${ids},
    }); */
    return reponse;
  }

  /**
   * @throws {PublicationNotFoundException}
   */
  async findOne(id: number): Promise<PublicationResponseDto> {
    const publication = await this.publicationRepository.findOneBy({ id });

    if (!publication) {
      throw new PublicationNotFoundException(PublicationNotFoundException.MESSAGE);
    }

    return new PublicationResponseDto(publication);
  }
}
