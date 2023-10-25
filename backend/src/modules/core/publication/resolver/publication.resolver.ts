import { Resolver, Args, Query } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { Publication } from '../entities/publication.entity';
import { PublicationService } from '../services/publication.service';
import PublicationsQueryDto from '../dto/publications-query.dto';

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
