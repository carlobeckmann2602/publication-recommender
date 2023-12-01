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
      //await fetch('http://ai_backend:8000/arxiv_6k-v2/load');
      //const result = await (await fetch(`http://ai_backend:8000/arxiv_6k-v2/match_token/${query}`)).json();
      const result = {
        matches: [
          { id: '82cd0b62-ba19-4151-874d-518ed5aeb2a2' },
          { id: '8f5fc827-0d29-4d94-a3d6-9a08ffe1435d' },
          { id: 'a184eff2-de72-406b-b62e-060633dd5663' },
          { id: '10abc56d-1fbe-41b2-b862-e15ba37e8d42' },
          { id: 'b18bf642-80aa-407f-a978-06e219044d2e' },
          { id: '69a940c1-e1fa-4eb5-97d0-1bad66b77373' },
          { id: '84aed547-e3c4-4199-a977-69d9d15d6eba' },
          { id: '3640b883-1d67-4977-8cf7-2b74a1dd9cee' },
          { id: 'cc4fc692-a0d9-47d7-a5d9-8d71350e2de4' },
          { id: '52de13c2-4a58-4411-8d00-358fec60efaf' },
        ],
      };
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
