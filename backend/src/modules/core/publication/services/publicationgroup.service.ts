import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../user/entities/user.entity';
import { PublicationGroupCreateDto } from '../dto/publicationgroup-create.dto';
import { PublicationGroupDto } from '../dto/publicationgroup.dto';
import { PublicationGroup } from '../entities/publicationgroup.entity';
import { PublicationGroupForbiddenException } from '../exceptions/publicationgroup-forbidden.exception';
import { PublicationGroupNotFoundException } from '../exceptions/publicationgroup-not-found.exception';
import { PublicationService } from './publication.service';

@Injectable()
export class PublicationGroupService {
  constructor(
    @InjectRepository(PublicationGroup)
    private publicationGroupRepository: Repository<PublicationGroup>,
    private publicationService: PublicationService,
  ) {}

  async all(user: User): Promise<PublicationGroup[]> {
    const publicationGroups = await this.publicationGroupRepository.find({
      where: {
        userId: user.id,
      },
      relations: { publications: { authors: true, embeddings: true } },
      order: { name: 'ASC' },
    });

    return publicationGroups;
  }

  async getPublicationGroup(user: User, publicationGroupId: string): Promise<PublicationGroup> {
    const publicationGroup = await this.publicationGroupRepository.findOne({
      where: {
        id: publicationGroupId,
      },
      relations: { publications: { authors: true, embeddings: true } },
    });

    if (!publicationGroup) {
      throw new PublicationGroupNotFoundException();
    }

    if (publicationGroup.userId !== user.id) {
      throw new PublicationGroupForbiddenException();
    }

    return publicationGroup;
  }

  /**
   * @throws {PublicationGroupNotFoundException}
   */
  async createNewPublicationGroup(
    user: User,
    publicationGroupDto: PublicationGroupCreateDto,
  ): Promise<PublicationGroup> {
    const createdPublicationGroup = await this.publicationGroupRepository.save(
      new PublicationGroup(uuidv4(), user.id, publicationGroupDto.name, publicationGroupDto.color),
    );
    return createdPublicationGroup;
  }

  /**
   * @throws {PublicationGroupNotFoundException}
   */
  async updatePublicationGroup(user: User, publicationGroupDto: PublicationGroupDto): Promise<void> {
    const publicationGroup = await this.publicationGroupRepository.findOne({
      where: {
        id: publicationGroupDto.id,
      },
    });

    if (!publicationGroup) {
      throw new PublicationGroupNotFoundException();
    }

    if (publicationGroup.userId !== user.id) {
      throw new PublicationGroupForbiddenException();
    }

    await this.publicationGroupRepository.save(publicationGroupDto);
  }

  /**
   * @throws {PublicationGroupNotFoundException}
   */
  async deletePublicationGroup(user: User, publicationgroupId: string): Promise<void> {
    const publicationGroup = await this.publicationGroupRepository.findOne({
      where: {
        id: publicationgroupId,
      },
    });

    if (!publicationGroup) {
      throw new PublicationGroupNotFoundException();
    }

    if (publicationGroup.userId !== user.id) {
      throw new PublicationGroupForbiddenException();
    }

    await this.publicationGroupRepository.delete(publicationgroupId);
  }

  /**
   * @throws {PublicationNotFoundException}
   */
  async addPublications(user: User, publicationGroupId: string, publicationIds: string[]): Promise<void> {
    const publicationGroup = await this.publicationGroupRepository.findOne({
      where: {
        id: publicationGroupId,
      },
      relations: { publications: true },
    });

    if (!publicationGroup) {
      throw new PublicationGroupNotFoundException();
    }

    if (publicationGroup.userId !== user.id) {
      throw new PublicationGroupForbiddenException();
    }

    for (const publicationId of publicationIds) {
      const publication = await this.publicationService.findOne(publicationId);
      publicationGroup.publications.push(publication);
    }
    await this.publicationGroupRepository.save(publicationGroup);
  }

  /**
   * @throws {PublicationNotFoundException}
   */
  async removePublication(user: User, publicationGroupId: string, publicationId: string): Promise<void> {
    const publicationGroup = await this.publicationGroupRepository.findOne({
      where: {
        id: publicationGroupId,
      },
      relations: { publications: true },
    });

    if (!publicationGroup) {
      throw new PublicationGroupNotFoundException();
    }

    if (publicationGroup.userId !== user.id) {
      throw new PublicationGroupForbiddenException();
    }

    if (!publicationGroup.publications || publicationGroup.publications.length === 0) return;

    publicationGroup.publications = publicationGroup.publications.filter((current) => current.id != publicationId);
    await this.publicationGroupRepository.save(publicationGroup);
  }
}
