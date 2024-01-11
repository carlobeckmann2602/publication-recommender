import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MatchGroup } from 'src/modules/cron/dto/match-group.dto';
import { In, Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { RecommendationCreateDto } from '../dto/recommendation-create.dto';
import { Publication } from '../entities/publication.entity';
import { Recommendation } from '../entities/recommendation.entity';
import { AiBackendException } from '../exceptions/ai-backend.exception';
import { NoFavoritesForRecommendationException } from '../exceptions/no-favorites-for-recommendation.exception';
import { RecommendationException } from '../exceptions/recommendation.exception';

@Injectable()
export class RecommendationService {
  constructor(
    private configService: ConfigService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,

    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
  ) {}

  private readonly logger = new Logger(RecommendationService.name);

  async all(user: User): Promise<Recommendation[]> {
    const userWithRecommendations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: { recommendations: { publications: true } },
      order: { recommendations: { createdAt: 'DESC' } },
    });
    console.log('userWithRecommendations (DESC) ', userWithRecommendations);
    return userWithRecommendations.recommendations;
  }

  async generateRecommendationsForAllUser(): Promise<void> {
    const users = await this.userRepository.find({
      relations: { favorites: true, recommendations: { publications: true } },
    });
    const usersWithFavorites = users.filter((user) => user.favorites.length !== 0);

    for (const user of usersWithFavorites) {
      await this.createRecommendationforUserFromFavorites(user);
    }
  }

  async createNewRecommendation(dto: RecommendationCreateDto | null, user: User | null): Promise<Recommendation> {
    if (!dto && !user) {
      throw new RecommendationException("can't create recommendation when dto is null and user is null");
    } else if (!dto && user) {
      return await this.createRecommendationforUserFromFavorites(user);
    } else if (dto && user) {
      return this.createRecommendationforUser(dto, user);
    } else if (dto && !user) {
      return await this.createRecommendationForGuest(dto);
    }
  }

  async createRecommendationforUserFromFavorites(user: User) {
    const userData = await this.userRepository.findOne({
      where: { id: user.id },
      relations: { favorites: true, recommendations: { publications: true } },
    });
    if (userData.favorites.length === 0) {
      throw new NoFavoritesForRecommendationException();
    }
    const group = userData.favorites.map((favorite) => favorite.publicationId);
    const exclude = userData.recommendations
      .flatMap((recommendation) => recommendation.publications)
      .map((publication) => publication.id);
    const recommendationPublicationIds = await this.getRecommendationsFromAiBackend(group, exclude);
    const publications = await this.publicationRepository.find({
      where: {
        id: In(recommendationPublicationIds),
      },
    });
    return await this.recommendationRepository.save({
      userId: user.id,
      publications: publications,
    });
  }

  async createRecommendationforUser(dto: RecommendationCreateDto, user: User) {
    const recommendationPublicationIds = await this.getRecommendationsFromAiBackend(dto.group, dto.exlude, dto.amount);
    const publications = await this.publicationRepository.find({
      where: {
        id: In(recommendationPublicationIds),
      },
    });
    return await this.recommendationRepository.save({
      user,
      publications: publications,
    });
  }

  async createRecommendationForGuest(dto: RecommendationCreateDto) {
    const recommendationPublicationIds = await this.getRecommendationsFromAiBackend(dto.group, dto.exlude, dto.amount);
    const publications = await this.publicationRepository.find({ where: { id: In(recommendationPublicationIds) } });
    const recommendation = new Recommendation();
    recommendation.publications = publications;
    recommendation.createdAt = new Date();
    return recommendation;
  }

  async getRecommendationsFromAiBackend(
    group: string[],
    exclude?: string[] | null,
    amount?: number | null,
  ): Promise<string[]> {
    const groupParams = group.map((publicationId) => ['group', publicationId]) ?? [];
    const excludeParams = exclude?.map((publicationId) => ['excluded_ids', publicationId]) ?? [];
    const params = new URLSearchParams(groupParams.concat(excludeParams));
    let amountOrDefault = amount ?? 10;
    params.set('amount', amountOrDefault.toString());

    const baseRecommendationUrl = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/match_group`;
    const url = `${baseRecommendationUrl}?${params.toString()}`;
    try {
      const data = await (await fetch(url)).json();
      const matchGroup = plainToInstance(MatchGroup, data);
      const errors = await validate(matchGroup);

      if (errors.length !== 0) {
        throw new AiBackendException();
      }

      return matchGroup.matches.map((match) => match.id);
    } catch (e) {
      throw new AiBackendException(`error when fetching ${url}`);
    }
  }
}
