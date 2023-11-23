import { UseGuards } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import PublicationsQueryDto from '../dto/publications-query.dto';
import { Publication } from '../entities/publication.entity';
import { PublicationService } from '../services/publication.service';

@Resolver(() => Publication)
export class PublicationResolver {
  constructor(private publicationService: PublicationService) {}

  @Query(() => [Publication])
  //@UseGuards(JwtAuthGuard)
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
  //@UseGuards(JwtAuthGuard)
  async publication(@AuthUser() user, @Args('id') id: string): Promise<Publication> {
    try {
      return await this.publicationService.findOne(id);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }
}
