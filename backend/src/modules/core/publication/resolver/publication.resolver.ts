import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import PublicationsQueryDto from '../dto/publications-query.dto';
import { Publication } from '../entities/publication.entity';
import { PublicationService } from '../services/publication.service';

@Resolver(() => Publication)
export class PublicationResolver {
  constructor(
    @Inject(PublicationService)
    private publicationService: PublicationService,
  ) {}

  @Query(() => [Publication])
  async publications(
    @Args('filter', {
      type: () => PublicationsQueryDto,
      nullable: true,
    })
    query: PublicationsQueryDto,
  ): Promise<Publication[]> {
    return await this.publicationService.findAll(query);
  }

  @Query(() => Publication)
  async publication(@Args('id') id: string): Promise<Publication> {
    return await this.publicationService.findOne(id);
  }
}
