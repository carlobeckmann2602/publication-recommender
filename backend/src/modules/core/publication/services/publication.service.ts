import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Brackets, FindOptionsOrder, In, IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { NearestNeighbor } from '../classes/nearestNeighbor';
import { SearchFilters } from '../classes/searchFilters';
import { PublicationSourceWithSourceIdDto } from '../dto/PublicationBySource.dto.';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { MaximumAmountOfSentencesForPublicationResponseDto } from '../dto/maximumAmountOfSentencesForPublication-response.dto';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { PublicationChunkRequestDto } from '../dto/publication-vectors-request.dto';
import { SavePublicationsCoordiantesDto } from '../dto/save-publications-coordinates.dto';
import { Author } from '../entities/author.entity';
import { Embedding } from '../entities/embedding.entity';
import { Publication } from '../entities/publication.entity';
import { NoPublicationWithDateForSourceException } from '../exceptions/no-publication-with-date-for-source.exception';
import { PublicationNotFoundException } from '../exceptions/publication-not-found.exception';
import { ValidationException } from '../exceptions/validation.exception';
import { SortStrategyVo } from '../vo/sortStrategy.vo';
import { SourceVo } from '../vo/source.vo';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
    @InjectRepository(Embedding)
    private embeddingRepository: Repository<Embedding>,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(PublicationService.name);

  /**
   * @throws {PublicationNotFoundException}
   */
  async findOne(id: string): Promise<Publication> {
    const publication = await this.publicationRepository.findOne({
      where: { id },
      relations: { embeddings: true, authors: true },
    });

    if (!publication) {
      throw new PublicationNotFoundException(PublicationNotFoundException.MESSAGE);
    }

    return publication;
  }

  async count(source?: SourceVo): Promise<number> {
    return await this.publicationRepository.count({ where: { source } });
  }

  async oldest(source: SourceVo): Promise<Publication> {
    const result = await this.publicationRepository.findOne({
      where: { source, date: Not(IsNull()) },
      order: { date: 'ASC' },
      relations: { embeddings: true, authors: true },
    });
    if (!result) {
      throw new NoPublicationWithDateForSourceException();
    }
    return result;
  }

  async newest(source: SourceVo): Promise<Publication> {
    const result = await this.publicationRepository.findOne({
      where: { source, date: Not(IsNull()) },
      order: { date: 'DESC' },
      relations: { embeddings: true, authors: true },
    });
    if (!result) {
      throw new NoPublicationWithDateForSourceException();
    }
    return result;
  }

  async getPublicationBySourceWithId(input: PublicationSourceWithSourceIdDto): Promise<Publication> {
    return this.publicationRepository.findOneBy({ exId: input.exId, source: input.source });
  }

  async createPublication(dto: CreatePublicationDto): Promise<Publication> {
    const publication = new Publication();
    publication.title = dto.title;
    publication.publisher = dto.publisher;
    publication.exId = dto.exId;
    publication.source = SourceVo.ARXIV;
    publication.abstract = dto.abstract;
    publication.embeddings = dto.embeddingsCreateDtos.map(
      (embeddingsCreateDto) => new Embedding(embeddingsCreateDto.text, embeddingsCreateDto.vector),
    );
    publication.authors = dto.authorsCreateDtos.map((authorCreateDto) => new Author(authorCreateDto.name));
    publication.url = dto.url;
    publication.doi = Array.isArray(dto.doi) ? dto.doi : [];
    publication.date = dto.date;
    return await this.publicationRepository.save(publication);
  }

  async savePublicationsCoordinates(dto: SavePublicationsCoordiantesDto): Promise<PublicationResponseDto[]> {
    const ids = dto.coordinates.map((coordinate) => coordinate.id);
    const publications = await this.publicationRepository.find({
      where: { id: In(ids) },
      relations: { embeddings: true },
    });
    const updatedPublications = publications.map((publication) => ({
      ...publication,
      coordinate: dto.coordinates.find((item) => item.id == publication.id).coordinate,
    }));
    await this.publicationRepository.save(updatedPublications);
    return updatedPublications.map((publication) => {
      return new PublicationResponseDto(publication);
    });
  }

  async findAllForSearchQuery(
    by: string,
    page: number,
    amountPerPage: number,
    searchFilters?: SearchFilters,
    sortBy?: SortStrategyVo,
  ) {
    try {
      let portionOfPapersThatShouldComeFromDB = 0.5;
      if (searchFilters && (searchFilters.title || searchFilters.author || searchFilters.doi || searchFilters.years)) {
        portionOfPapersThatShouldComeFromDB = 1;
      }

      const matchingPublicationsBySearchQuery = await this.findAllInDB(
        by,
        page,
        amountPerPage * portionOfPapersThatShouldComeFromDB,
        sortBy,
        searchFilters,
      );
      const numberOfMatchingPublications = matchingPublicationsBySearchQuery.length;
      const { nearestNeighborsForPage, coordinate } = await this.findAllBySimilarityForSearchQuery(
        by,
        page,
        amountPerPage - numberOfMatchingPublications,
        sortBy,
      );

      let matchingPublicationsBySimilarity = nearestNeighborsForPage.map(
        (nearestNeighbor) => nearestNeighbor.publication,
      );

      matchingPublicationsBySimilarity = matchingPublicationsBySimilarity.filter(
        (publication) => !matchingPublicationsBySearchQuery.some((matchingPub) => matchingPub.id === publication.id),
      );

      return {
        matchingPublicationsBySearchQuery: matchingPublicationsBySearchQuery,
        matchingPublicationsBySimilarity: matchingPublicationsBySimilarity,
        queryCoordinates: coordinate,
      };
    } catch (error) {
      this.logger.error('Error while searching for publications', error);
      throw new Error('Error while searching for publications');
    }
  }

  async findAllSimilarForPublicationWithId(id: string, page: number, amountPerPage: number, sortBy?: SortStrategyVo) {
    const publicationWithId = await this.findOne(id);

    const { nearestNeighborsForPage, coordinate } = await this.findAllBySimilarityForPublicationWithId(
      id,
      page,
      amountPerPage,
      sortBy,
    );

    let similarPublications = nearestNeighborsForPage.map((nearestNeighbor) => nearestNeighbor.publication);

    // only return unique publications and exclude the publication with the given id
    similarPublications = similarPublications
      .filter((publication, index, self) => {
        const indexOfFirstPubWithThisId = self.findIndex((p) => p.id === publication.id);
        return indexOfFirstPubWithThisId === index;
      })
      .filter((publication) => publication.id !== publicationWithId.id);

    return {
      similarPublicationsForPublicationWithId: similarPublications,
      queryCoordinates: coordinate,
    };
  }

  private async findAllBySimilarityForPublicationWithId(
    id: string,
    page: number,
    amountPerPage: number,
    sortBy: SortStrategyVo,
  ) {
    const publication = await this.publicationRepository.findOne({
      where: { id },
      relations: { embeddings: true, authors: true },
    });
    const vectors = publication.embeddings.map((embedding) => JSON.parse(embedding.vector));
    const excludeList = [id];

    const nearestNeighbors = await this.getPublicationsForVectors(
      vectors,
      (page + 1) * amountPerPage,
      excludeList,
      sortBy,
    );
    const nearestNeighborsForPage = nearestNeighbors.slice(page * amountPerPage, page * amountPerPage + amountPerPage);
    return { nearestNeighborsForPage, coordinate: publication.coordinate };
  }

  private async findAllBySimilarityForSearchQuery(
    query: string,
    page: number,
    amountPerPage: number,
    sortBy?: SortStrategyVo,
  ) {
    const sanitizedQuery = encodeURIComponent(query).replace('%2F', '%2_F');
    const url = new URL(`/encode/${sanitizedQuery}`, this.configService.get('PROJECT_AI_BACKEND_URL'));
    const vector = await (await fetch(url)).json();
    const coordinate = await this.getVectorCoordinate(vector);

    const nearestNeighbors = await this.getPublicationsForVectors([vector], (page + 1) * amountPerPage, [], sortBy);
    const nearestNeighborsForPage = nearestNeighbors.slice(page * amountPerPage, page * amountPerPage + amountPerPage);
    return { nearestNeighborsForPage, coordinate };
  }

  async getPublicationsForVectors(
    vectors: number[][],
    publicationAmountToReturn: number,
    excludeList: string[],
    sortBy?: SortStrategyVo,
  ): Promise<NearestNeighbor[]> {
    const maximumAmountOfSentencesForPublication = await this.getMaximumAmountOfSentencesForPublication();
    const amountToFetchPerVector =
      (excludeList.length + publicationAmountToReturn + 1) * maximumAmountOfSentencesForPublication.amount;
    const nearestNeighborResponsesAsPromises = vectors.map((vector) =>
      this.getNearestNeighbors(vector, amountToFetchPerVector, sortBy),
    );

    const nearestNeighborResponses = (await Promise.all(nearestNeighborResponsesAsPromises)).flat();

    const response = nearestNeighborResponses
      .filter((response) => !excludeList.includes(response.publication.id))
      .filter((response, index, self) => {
        const indexOfFirstResponseForPublication = self.findIndex(
          (innerResponse) => innerResponse.publication.id === response.publication.id,
        );
        return indexOfFirstResponseForPublication === index;
      });

    return response;
  }

  private async findAllInDB(
    query: string,
    page: number,
    amountPerPage: number,
    sortBy: SortStrategyVo,
    searchFilters?: SearchFilters,
  ) {
    const queryAsTsQuery = PublicationService.toTsQuery(query, 'OR');
    const titleAsTsQuery = searchFilters?.title ? PublicationService.toTsQuery(searchFilters.title, 'AND') : undefined;
    const authorAsTsQuery = searchFilters?.author
      ? PublicationService.toTsQuery(searchFilters.author, 'AND')
      : undefined;
    const doisFromQuery = PublicationService.parseDois(query);

    const titleMatchesQueryAsTsQuery =
      "to_tsvector('english',publication.title) @@ to_tsquery('english', :queryAsTsQuery)";
    const authorMatchesQueryAsTsQuery =
      "publication.id IN (SELECT author.publication_id FROM authors author WHERE to_tsvector('english',author.name) @@ to_tsquery('english', :queryAsTsQuery))";
    const doiMatchesDoiFromQuery = 'publication.doi && :doisFromQuery';

    // combinations of orderBy, joins, skip and take seem to be buggy
    // part of the query is from https://github.com/typeorm/typeorm/issues/3501#issuecomment-1506749457
    let matchingPublicationsQuery = this.publicationRepository
      .createQueryBuilder('publication')
      .leftJoinAndSelect('publication.embeddings', 'embedding')
      .leftJoinAndMapMany('publication.authors', Author, 'author', 'author.publication_id = publication.id')
      .where(
        new Brackets((qb) => {
          qb.where(titleMatchesQueryAsTsQuery, { queryAsTsQuery })
            .orWhere(authorMatchesQueryAsTsQuery, { queryAsTsQuery })
            .orWhere(doiMatchesDoiFromQuery, { doisFromQuery });
        }),
      );

    if (searchFilters?.years) {
      matchingPublicationsQuery.andWhere(`date_part('year', publication.date) = ANY(:years)`, {
        years: searchFilters.years.map((year) => Number(year)),
      });
    }
    if (searchFilters?.doi) {
      matchingPublicationsQuery.andWhere(doiMatchesDoiFromQuery, { doisFromQuery: [searchFilters.doi] });
    }
    if (searchFilters?.title) {
      matchingPublicationsQuery.andWhere(titleMatchesQueryAsTsQuery, { queryAsTsQuery: titleAsTsQuery });
    }
    if (searchFilters?.author) {
      matchingPublicationsQuery.andWhere(authorMatchesQueryAsTsQuery, { queryAsTsQuery: authorAsTsQuery });
    }

    matchingPublicationsQuery = PublicationService.getFindAllInDBOrderBy(
      sortBy,
      matchingPublicationsQuery,
      queryAsTsQuery,
    );

    const matchingPublications = await matchingPublicationsQuery
      .skip(page * amountPerPage)
      .take(amountPerPage)
      .getMany();

    this.logger.log(`Found ${matchingPublications.length} publications by search query`);

    return matchingPublications;
  }

  async providePublicationChunk(dto: PublicationChunkRequestDto): Promise<Publication[]> {
    return await this.publicationRepository.find({
      order: { id: 'ASC' },
      skip: dto.chunk * dto.chunkSize,
      take: dto.chunkSize,
      relations: { embeddings: true },
    });
  }

  async getMaximumAmountOfSentencesForPublication(): Promise<MaximumAmountOfSentencesForPublicationResponseDto> {
    const result = await this.embeddingRepository
      .createQueryBuilder('embedding')
      .select('count(*) as amount')
      .groupBy('embedding.publication_id')
      .orderBy('amount', 'DESC')
      .limit(1)
      .getRawOne();

    const parsedResult = plainToClass(MaximumAmountOfSentencesForPublicationResponseDto, result);
    const errors = await validate(parsedResult);
    if (errors.length > 0) {
      this.logger.error('error while querying for max sentence count', errors);
      throw new ValidationException(errors[0].toString());
    }

    return parsedResult;
  }

  async getNearestNeighbors(vector: number[], amount: number, sortBy?: SortStrategyVo): Promise<NearestNeighbor[]> {
    const queryBuilder = this.embeddingRepository
      .createQueryBuilder('embedding')
      .leftJoinAndSelect('embedding.publication', 'publication')
      .addSelect(`embedding.vector <-> '${JSON.stringify(vector)}' as distance`)
      .orderBy('distance', 'ASC');

    const results = await queryBuilder.limit(amount).getRawAndEntities();

    // The above query only returns the embedding that was close to the vector
    // In order to provide all embeddings for a publication
    // the query needs become more complex or a second query as
    // below is necessary
    const publicationIds = results.entities.map((entity) => entity.publicationId);
    const publications = await this.publicationRepository.find({
      where: { id: In(publicationIds) },
      relations: { embeddings: true, authors: true },
      order: PublicationService.getNearestNeighborOrderBy(sortBy),
    });

    const responseDtos = publications.map((publication) => {
      const embedding = results.entities.find((entity) => entity.publicationId === publication.id);
      const distance = results.raw.find((entity) => entity.embedding_id === embedding.id).distance;
      return new NearestNeighbor(publication, distance, embedding.id);
    });

    return responseDtos;
  }

  static toTsQuery(inputString: string, concatStrategy: 'AND' | 'OR'): string {
    // remove special characters
    const sanitizedInputString = inputString.replace(/[^a-zA-Z0-9 ]/g, '');
    const inputStringSingleWords = sanitizedInputString.split(' ');

    return inputStringSingleWords
      .filter((word) => !/^$|^\s+$/.test(word)) // filter out empty/blank strings
      .map((word) => `${word}:*`)
      .join(concatStrategy === 'AND' ? ' & ' : ' | ');
  }

  private static parseDois(from: string): string[] {
    // This will match most DOIs, but not all: https://www.crossref.org/blog/dois-and-matching-regular-expressions/
    const doiRegex = /10.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;

    const doiMatchArray = from.match(doiRegex);
    if (doiMatchArray === null) {
      return [];
    }
    return doiMatchArray;
  }

  async getVectorCoordinate(vector: string): Promise<number[] | null> {
    const coordinateUrl = new URL(`/generate_coordinate`, this.configService.get('PROJECT_AI_BACKEND_URL'));
    try {
      return await (
        await fetch(coordinateUrl, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(vector),
        })
      ).json();
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  private static getFindAllInDBOrderBy(
    sortBy: SortStrategyVo,
    matchingPublicationsQuery: SelectQueryBuilder<Publication>,
    queryAsTsQuery: string,
  ) {
    switch (sortBy) {
      case SortStrategyVo.NEWEST:
        return matchingPublicationsQuery.orderBy('publication.date', 'DESC');
      case SortStrategyVo.OLDEST:
        return matchingPublicationsQuery.orderBy('publication.date', 'ASC');
      case SortStrategyVo.A_TO_Z:
        return matchingPublicationsQuery.orderBy('publication.title', 'ASC');
      case SortStrategyVo.Z_TO_A:
        return matchingPublicationsQuery.orderBy('publication.title', 'DESC');
      case SortStrategyVo.RELEVANCE:
      default:
        return matchingPublicationsQuery
          .addSelect(`ts_rank_cd(to_tsvector(publication.title), to_tsquery('${queryAsTsQuery}'))`, 'rank')
          .orderBy('rank', 'DESC');
    }
  }

  private static getNearestNeighborOrderBy(sortBy: SortStrategyVo): FindOptionsOrder<Publication> {
    switch (sortBy) {
      case SortStrategyVo.NEWEST:
        return { date: 'DESC' };
      case SortStrategyVo.OLDEST:
        return { date: 'ASC' };
      case SortStrategyVo.A_TO_Z:
        return { title: 'ASC' };
      case SortStrategyVo.Z_TO_A:
        return { title: 'DESC' };
      case SortStrategyVo.RELEVANCE:
        return {};
    }
  }
}
