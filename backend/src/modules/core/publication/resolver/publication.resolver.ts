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
    @AuthUser() user,
    @Args('filter')
    query: string,
  ): Promise<PublicationResponseDto[]> {
    try {
      return await this.publicationService.findAll(query);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Query(() => PublicationResponseDto)
  async publication(@AuthUser() user, @Args('id') id: number): Promise<PublicationResponseDto> {
    try {
      return await this.publicationService.findOne(id);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }
}
