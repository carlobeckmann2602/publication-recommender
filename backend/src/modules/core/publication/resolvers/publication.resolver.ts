import {
  BadRequestException,
  InternalServerErrorException,
  SetMetadata,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../user/entities/user.entity';
import { PublicationSourceWithSourceIdDto } from '../dto/PublicationBySource.dto.';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { MaximumAmountOfSentencesForPublicationResponseDto } from '../dto/maximumAmountOfSentencesForPublication-response.dto';
import { NearestNeighborRequestDto } from '../dto/nearestneighbor-request.dto';
import { NearestNeighborsResponseDto } from '../dto/nearestneighbors-response.dto';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { PublicationChunkRequestDto } from '../dto/publication-vectors-request.dto';
import { PublicationsSearchByIdResponseDto } from '../dto/publications-search-by-id-response-dto';
import { PublicationsSearchResponseDto } from '../dto/publications-search-response-dto';
import PublicationsSearchDto from '../dto/publications-search.dto';
import { SavePublicationsCoordiantesDto } from '../dto/save-publications-coordinates.dto';
import SimilarPublicationsForPublicationWithIdDto from '../dto/similar-publications-for-publication-with-id.dto';
import { NoPublicationWithDateForSourceException } from '../exceptions/no-publication-with-date-for-source.exception';
import { FavoriteService } from '../services/favorites.service';
import { PublicationService } from '../services/publication.service';
import { SourceVo } from '../vo/source.vo';

@Resolver()
export class PublicationResolver {
  constructor(
    private readonly publicationService: PublicationService,
    private readonly favoriteService: FavoriteService,
  ) {}

  @Query(() => PublicationsSearchResponseDto)
  @SetMetadata('optional', true)
  @UseGuards(JwtAuthGuard)
  async publications(
    @AuthUser() user: User | null,
    @Args('publicationsSearchDto')
    dto: PublicationsSearchDto,
  ): Promise<PublicationsSearchResponseDto> {
    try {
      const publications = await this.publicationService.findAllForSearchQuery(
        dto.searchInput,
        dto.page,
        dto.amountPerPage,
        dto.filters,
        dto.sortStrategy,
      );

      const matchingPublicationsPromise = this.favoriteService.publicationsWithFavorites(
        publications.matchingPublicationsBySearchQuery,
        user,
      );
      const similarPublicationsPromise = this.favoriteService.publicationsWithFavorites(
        publications.matchingPublicationsBySimilarity,
        user,
      );

      return await Promise.all([matchingPublicationsPromise, similarPublicationsPromise]).then(
        ([matchingPublications, similarPublications]) => {
          return new PublicationsSearchResponseDto(
            dto.searchInput,
            publications.queryCoordinates,
            matchingPublications,
            similarPublications,
          );
        },
      );
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Query(() => PublicationsSearchByIdResponseDto)
  @SetMetadata('optional', true)
  @UseGuards(JwtAuthGuard)
  async similarPublicationsForPublicationWithId(
    @AuthUser() user: User | null,
    @Args('similarPublicationsForPublicationWithIdDto')
    dto: SimilarPublicationsForPublicationWithIdDto,
  ): Promise<PublicationsSearchByIdResponseDto> {
    try {
      const { similarPublicationsForPublicationWithId, queryCoordinates } =
        await this.publicationService.findAllSimilarForPublicationWithId(
          dto.id,
          dto.page,
          dto.amountPerPage,
          dto.sortStrategy,
        );

      return new PublicationsSearchByIdResponseDto(
        queryCoordinates,
        await this.favoriteService.publicationsWithFavorites(similarPublicationsForPublicationWithId, user),
      );
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Query(() => Int)
  async publicationCount(
    @Args('source', {
      type: () => SourceVo,
      nullable: true,
    })
    source?: SourceVo,
  ): Promise<number> {
    return await this.publicationService.count(source);
  }

  @Query(() => PublicationResponseDto)
  async publication(@Args('id') id: string): Promise<PublicationResponseDto> {
    try {
      const publication = await this.publicationService.findOne(id);
      return new PublicationResponseDto(publication);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Query(() => PublicationResponseDto)
  async oldest(@Args('source', { type: () => SourceVo }) source: SourceVo) {
    try {
      const publication = await this.publicationService.oldest(source);
      return new PublicationResponseDto(publication);
    } catch (e) {
      if (e instanceof NoPublicationWithDateForSourceException) {
        throw new NotFoundException(e);
      }
    }
  }

  @Query(() => PublicationResponseDto)
  async newest(@Args('source', { type: () => SourceVo }) source: SourceVo) {
    try {
      const publication = await this.publicationService.newest(source);
      return new PublicationResponseDto(publication);
    } catch (e) {
      if (e instanceof NoPublicationWithDateForSourceException) {
        throw new NotFoundException(e);
      }
    }
  }

  @Query(() => [PublicationResponseDto])
  async providePublicationChunk(
    @Args('providePublicationChunk', { type: () => PublicationChunkRequestDto })
    dto: PublicationChunkRequestDto,
  ): Promise<PublicationResponseDto[]> {
    const publications = await this.publicationService.providePublicationChunk(dto);
    return publications.map((publication) => new PublicationResponseDto(publication));
  }

  @Query(() => PublicationResponseDto, { nullable: true })
  async searchPublicationBySourceAndSourceId(
    @Args('publicationSourceAndSourceId', { type: () => PublicationSourceWithSourceIdDto })
    dto: PublicationSourceWithSourceIdDto,
  ): Promise<PublicationResponseDto | null> {
    try {
      const publication = await this.publicationService.getPublicationBySourceWithId(dto);
      return new PublicationResponseDto(publication);
    } catch (e) {
      return null;
    }
  }

  @Mutation(() => PublicationResponseDto)
  async savePublication(
    @Args('createPublication', { type: () => CreatePublicationDto }, new ValidationPipe({ transform: true }))
    dto: CreatePublicationDto,
  ): Promise<PublicationResponseDto> {
    try {
      const publication = await this.publicationService.createPublication(dto);
      return new PublicationResponseDto(publication);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Query(() => [NearestNeighborsResponseDto])
  async getNearestNeighbors(
    @Args('nearestNeighborRequestDto', new ValidationPipe()) dto: NearestNeighborRequestDto,
  ): Promise<NearestNeighborsResponseDto[]> {
    const nearestNeighbors = await this.publicationService.getNearestNeighbors(dto.vector, dto.amount);
    return nearestNeighbors.map((nearestNeighbor) => new NearestNeighborsResponseDto(nearestNeighbor));
  }

  @Mutation(() => [PublicationResponseDto])
  async savePublicationsCoordinates(
    @Args(
      'savePublicationsCoordinatesDto',
      { type: () => SavePublicationsCoordiantesDto },
      new ValidationPipe({ transform: true }),
    )
    dto: SavePublicationsCoordiantesDto,
  ): Promise<PublicationResponseDto[]> {
    try {
      const publicationDtos = await this.publicationService.savePublicationsCoordinates(dto);
      return publicationDtos;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Query(() => MaximumAmountOfSentencesForPublicationResponseDto)
  async maximumAmountOfSentencesForPublication(): Promise<MaximumAmountOfSentencesForPublicationResponseDto> {
    try {
      return await this.publicationService.getMaximumAmountOfSentencesForPublication();
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
