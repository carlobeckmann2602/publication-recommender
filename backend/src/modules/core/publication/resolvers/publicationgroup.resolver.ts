import { InternalServerErrorException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../user/entities/user.entity';
import { PublicationGroupCreateDto } from '../dto/publicationgroup-create.dto';
import { PublicationGroupResponseDto } from '../dto/publicationgroup-response.dto';
import { PublicationGroupDto } from '../dto/publicationgroup.dto';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { PublicationGroupService } from '../services/publicationgroup.service';

@Resolver()
export class PublicationGroupResolver {
  constructor(private publicationGroupService: PublicationGroupService) {}

  @Query(() => [PublicationGroupResponseDto])
  @UseGuards(JwtAuthGuard)
  async publicationGroups(@AuthUser() user: User): Promise<PublicationGroupResponseDto[]> {
    try {
      const publicationGroups = await this.publicationGroupService.all(user);
      return publicationGroups.map((publicationgroup) => {
        const dto = new PublicationGroupResponseDto(publicationgroup);
        return dto;
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Query(() => PublicationGroupResponseDto)
  @UseGuards(JwtAuthGuard)
  async publicationGroup(
    @AuthUser() user: User,
    @Args('id') publicationgroupId: string,
  ): Promise<PublicationGroupResponseDto> {
    try {
      const publicationGroup = await this.publicationGroupService.getPublicationGroup(user, publicationgroupId);
      return new PublicationGroupResponseDto(publicationGroup);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Mutation(() => PublicationGroupResponseDto)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async createPublicationGroup(
    @AuthUser() user: User,
    @Args('data', { type: () => PublicationGroupCreateDto })
    dto: PublicationGroupCreateDto,
  ): Promise<PublicationGroupResponseDto> {
    try {
      const createdPublicationGroup = await this.publicationGroupService.createNewPublicationGroup(user, dto);
      return new PublicationGroupResponseDto(createdPublicationGroup);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Mutation(() => SuccessResponseDto)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async updatePublicationGroup(
    @AuthUser() user: User,
    @Args('data', { type: () => PublicationGroupDto })
    dto: PublicationGroupDto,
  ): Promise<SuccessResponseDto> {
    try {
      await this.publicationGroupService.updatePublicationGroup(user, dto);
      return new SuccessResponseDto(true);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Mutation(() => SuccessResponseDto)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async deletePublicationGroup(
    @AuthUser() user: User,
    @Args('id') publicationgroupId: string,
  ): Promise<SuccessResponseDto> {
    try {
      await this.publicationGroupService.deletePublicationGroup(user, publicationgroupId);
      return new SuccessResponseDto(true);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Mutation(() => SuccessResponseDto)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async addToPublicationGroup(
    @AuthUser() user: User,
    @Args('publicationgroup_id') publicationgroupId: string,
    @Args('publication_ids', { type: () => [String] }) publicationIds: string[],
  ): Promise<SuccessResponseDto> {
    try {
      await this.publicationGroupService.addPublications(user, publicationgroupId, publicationIds);
      return new SuccessResponseDto(true);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }

  @Mutation(() => SuccessResponseDto)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  async removeFromPublicationGroup(
    @AuthUser() user: User,
    @Args('publicationgroup_id') publicationgroupId: string,
    @Args('publication_id') publicationId: string,
  ): Promise<SuccessResponseDto> {
    try {
      await this.publicationGroupService.removePublication(user, publicationgroupId, publicationId);
      return new SuccessResponseDto(true);
    } catch (e) {
      throw new NotFoundException(null, e.message);
    }
  }
}
