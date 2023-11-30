import { InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { PublicationResponseDto } from '../dto/publication-response.dto';
import { Publication } from '../entities/publication.entity';
import { PublicationService } from '../services/publication.service';

@Resolver(() => Publication)
export class PublicationResolver {
  constructor(private publicationService: PublicationService) {}

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

  @Query(() => PublicationResponseDto)
  async publication(@AuthUser() user, @Args('id') id: string): Promise<PublicationResponseDto> {
    try {
      const publication = await this.publicationService.findOne(id);
      return new PublicationResponseDto(publication);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }
}
