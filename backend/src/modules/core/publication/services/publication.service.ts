import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { In, IsNull, Not, Repository } from 'typeorm';
import { PublicationSourceWithSourceIdDto } from '../dto/PublicationBySource.dto.';
import { AnnoyResultDto } from '../dto/annoy-result.dto';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { Publication } from '../entities/publication.entity';
import { AiBackendException } from '../exceptions/ai-backend.exception';
import { NoPublicationWithDateForSourceException } from '../exceptions/no-publication-with-date-for-source.exception';
import { PublicationNotFoundException } from '../exceptions/publication-not-found.exception';
import { SourceVo } from '../vo/source.vo';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
    private configService: ConfigService,
  ) {}

  async findAll(by: string, type: 'query' | 'id') {
    let parsedResult: AnnoyResultDto;
    const path = type === 'query' ? 'match_token' : 'match_id';

    try {
      const url = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/${path}/${by}`;
      const result = await (await fetch(url)).json();
      parsedResult = plainToClass(AnnoyResultDto, result);
      await validateOrReject(parsedResult);
    } catch (e) {
      throw new AiBackendException();
    }

    const ids = parsedResult.matches.map((singleResult) => singleResult.id);
    return await this.publicationRepository.find({ where: { id: In(ids) } });
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

  async count(source?: SourceVo): Promise<number> {
    return await this.publicationRepository.count({ where: { source } });
  }

  async oldest(source: SourceVo): Promise<Publication> {
    const results = await this.publicationRepository.find({
      where: { source, date: Not(IsNull()) },
      order: { date: 'DESC' },
    });
    const result = results[0];
    if (!result) {
      throw new NoPublicationWithDateForSourceException();
    }
    return result;
  }

  async newest(source: SourceVo): Promise<Publication> {
    const results = await this.publicationRepository.find({
      where: { source, date: Not(IsNull()) },
      order: { date: 'ASC' },
    });
    const result = results[0];
    if (!result) {
      throw new NoPublicationWithDateForSourceException();
    }
    return result;
  }

  async getPublikationBySourceWithId(input: PublicationSourceWithSourceIdDto): Promise<Publication> {
    return this.publicationRepository.findOneBy({ exId: input.exId, source: input.source });
  }

  async createPublication(dto: CreatePublicationDto): Promise<Publication> {
    const publication = new Publication();
    publication.title = dto.title;
    publication.publisher = dto.publisher;
    publication.exId = dto.exId;
    publication.source = SourceVo.ARXIV;
    publication.abstract = dto.abstract;
    publication.descriptor = dto.descriptor;
    publication.authors = dto.authors;
    publication.url = dto.url;
    publication.doi = dto.doi;
    publication.date = dto.date;
    return await this.publicationRepository.save(publication);
  }
}
