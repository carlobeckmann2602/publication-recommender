import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { PublicationVectorsRequestDto } from '../dto/publication-vectors-request.dto';
import PublicationsQueryDto from '../dto/publications-query.dto';
import { PublicationChunkDto } from '../dto/publikation-chunk.dto';
import { Publication } from '../entities/publication.entity';
import { DescriptorService } from '../services/descriptor.service';
import { PublicationService } from '../services/publication.service';

@Resolver(() => Publication)
export class PublicationResolver {
  constructor(
    private publicationService: PublicationService,
    private descriptorService: DescriptorService,
  ) {}

  @Query(() => [Publication])
  @UseGuards(JwtAuthGuard)
  async publications(
    @AuthUser() user,
    @Args('filter', {
      type: () => PublicationsQueryDto,
      nullable: true,
    })
    query: PublicationsQueryDto,
  ): Promise<Publication[]> {
    return await this.publicationService.findAll(query);
  }

  @Query(() => Publication)
  @UseGuards(JwtAuthGuard)
  async publication(@AuthUser() user, @Args('id') id: string): Promise<Publication> {
    try {
      return await this.publicationService.findOne(id);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Mutation((returns) => PublicationChunkDto)
  @UsePipes(ValidationPipe)
  async provideVectors(
    @Args('provideVectors', { type: () => PublicationVectorsRequestDto })
    dto: PublicationVectorsRequestDto,
  ): Promise<PublicationChunkDto> {
    return await this.descriptorService.getVectorsChunk(dto);
  }

  @Mutation((returns) => Publication)
  @UsePipes(ValidationPipe)
  async savePublication(
    @Args('createPublication', { type: () => CreatePublicationDto }, new ValidationPipe({ transform: true }))
    dto: CreatePublicationDto,
  ): Promise<Publication> {
    return await this.publicationService.createPublication(dto);
  }
}
