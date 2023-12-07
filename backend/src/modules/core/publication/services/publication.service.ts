import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { In, Repository } from 'typeorm';
import { AnnoyResultDto } from '../dto/annoy-result.dto';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { Publication } from '../entities/publication.entity';
import { AiBackendException } from '../exceptions/ai-backend.exception';
import { PublicationNotFoundException } from '../exceptions/publication-not-found.exception';
import { SourceVo } from '../vo/source.vo';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
  ) {}

  async findAll(query: string): Promise<Publication[]> {
    let parsedResult: AnnoyResultDto;
    try {
      await fetch('http://ai_backend:8000/arxiv_6k-v2/load');
      const result = await (await fetch(`http://ai_backend:8000/arxiv_6k-v2/match_token/${query}`)).json();

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

  async createPublication(dto: CreatePublicationDto): Promise<Publication> {
    const publication = new Publication();
    publication.title = dto.title;
    publication.publisher = dto.publisher;
    publication.exId = dto.exId;
    publication.source = SourceVo.fromString(dto.source);
    publication.abstract = dto.abstract;
    publication.descriptor = dto.descriptor;
    publication.authors = dto.authors;
    publication.url = dto.url;
    publication.doi = dto.doi;
    publication.date = dto.date;
    return await this.publicationRepository.save(publication);
  }
}
