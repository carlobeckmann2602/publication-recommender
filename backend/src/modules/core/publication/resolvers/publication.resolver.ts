import { InternalServerErrorException, SetMetadata, UseGuards, ValidationPipe } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../user/entities/user.entity';
import { PublicationSourceWithSourceIdDto } from '../dto/PublicationBySource.dto.';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { PublicationVectorsRequestDto } from '../dto/publication-vectors-request.dto';
import PublicationsSearchDto from '../dto/publications-search.dto';
import { PublicationChunkDto } from '../dto/publikation-chunk.dto';
import { NoPublicationWithDateForSourceException } from '../exceptions/no-publication-with-date-for-source.exception';
import { DescriptorService } from '../services/descriptor.service';
import { FavoriteService } from '../services/favorites.service';
import { PublicationService } from '../services/publication.service';
import { SourceVo } from '../vo/source.vo';

@Resolver()
export class PublicationResolver {
  constructor(
    private readonly publicationService: PublicationService,
    private readonly descriptorService: DescriptorService,
    private readonly favoriteService: FavoriteService,
  ) {}

  @Query(() => [PublicationResponseDto])
  @SetMetadata('optional', true)
  @UseGuards(JwtAuthGuard)
  async publications(
    @AuthUser() user: User | null,
    @Args('publicationsSearchDto')
    dto: PublicationsSearchDto,
  ): Promise<PublicationResponseDto[]> {
    try {
      const publications = await this.publicationService.findAll(
        dto.searchInput,
        dto.searchStrategy,
        dto.page || 0,
        dto.amountPerPage || 5,
      );
      return await this.favoriteService.publicationsWithFavorites(publications, user);
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

  @Query(() => PublicationChunkDto)
  async provideVectors(
    @Args('provideVectors', { type: () => PublicationVectorsRequestDto })
    dto: PublicationVectorsRequestDto,
  ): Promise<PublicationChunkDto> {
    return await this.descriptorService.getVectorsChunk(dto);
  }

  @Query(() => PublicationResponseDto, { nullable: true })
  async searchPublicationBySourceAndSourceId(
    @Args('publicationSourceAndSourceId', { type: () => PublicationSourceWithSourceIdDto })
    dto: PublicationSourceWithSourceIdDto,
  ): Promise<PublicationResponseDto | null> {
    try {
      const publication = await this.publicationService.getPublikationBySourceWithId(dto);
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
    const publication = await this.publicationService.createPublication(dto);
    return new PublicationResponseDto(publication);
  }
}
