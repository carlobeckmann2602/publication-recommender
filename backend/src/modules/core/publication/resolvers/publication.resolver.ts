import { InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { PublicationVectorsRequestDto } from '../dto/publication-vectors-request.dto';
import { PublicationChunkDto } from '../dto/publikation-chunk.dto';
import { Publication } from '../entities/publication.entity';
import { DescriptorService } from '../services/descriptor.service';
import { PublicationService } from '../services/publication.service';
import { SourceVo } from '../vo/source.vo';

@Resolver(() => Publication)
export class PublicationResolver {
  constructor(
    private publicationService: PublicationService,
    private descriptorService: DescriptorService,
  ) {}

  @Query(() => [PublicationResponseDto])
  async publications(
    @Args('filter')
    query: string,
  ): Promise<PublicationResponseDto[]> {
    try {
      const publications = await this.publicationService.findAll(query);
      return publications.map((publication) => new PublicationResponseDto(publication));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Query(() => Int)
  async publicationCount(@Args('source', { nullable: true }) source?: SourceVo): Promise<number> {
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

  @Mutation((returns) => PublicationChunkDto)
  async provideVectors(
    @Args('provideVectors', { type: () => PublicationVectorsRequestDto })
    dto: PublicationVectorsRequestDto,
  ): Promise<PublicationChunkDto> {
    return await this.descriptorService.getVectorsChunk(dto);
  }

  @Mutation((returns) => PublicationResponseDto)
  async savePublication(
    @Args('createPublication', { type: () => CreatePublicationDto }, new ValidationPipe({ transform: true }))
    dto: CreatePublicationDto,
  ): Promise<PublicationResponseDto> {
    const publication = await this.publicationService.createPublication(dto);
    return new PublicationResponseDto(publication);
  }
}
