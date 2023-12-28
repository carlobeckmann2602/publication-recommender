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
  private baseRecommendationUrl = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/match_group`;

  async all(user: User): Promise<Recommendation[]> {
    const userWithRecommendations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['recommendations', 'recommendations.publications'],
    });

    return userWithRecommendations.recommendations;
  }

  async generateRecommendationsForAllUser(): Promise<void> {
    const users = await this.userRepository.find({
      relations: { favorites: true, recommendations: { publications: true } },
    });
    const usersWithFavorites = users.filter((user) => user.favorites.length !== 0);

    for (const user of usersWithFavorites) {
      const groupParams = user.favorites.map((favorite) => ['group', favorite.publicationId]);
      const excludeParams = user.recommendations
        .flatMap((recommendation) => recommendation.publications)
        .map((publication) => ['excluded_ids', publication.id]);
      const params = new URLSearchParams(groupParams.concat(excludeParams));
      params.set('amount', '10');

      const url = `${this.baseRecommendationUrl}?${params.toString()}`;
      try {
        const data = await (await fetch(url)).json();
        const matchGroup = plainToInstance(MatchGroup, data);
        const errors = await validate(matchGroup);

        if (errors.length !== 0) {
          throw new AiBackendException();
        }

        const recommendations = matchGroup.matches.map((match) => ({ id: match.id }));
        await this.recommendationRepository.save({
          user,
          publications: recommendations,
        });
      } catch (e) {
        this.logger.log(`error when fetching ${url}: `, e);
      }
    }
  }

  async createNewRecommendation(dto: RecommendationCreateDto, user: User | null): Promise<Recommendation> {
    const groupParams = dto.group?.map((publicationId) => ['group', publicationId]) ?? [];
    const excludeParams = dto.exlude?.map((publicationId) => ['excluded_ids', publicationId]) ?? [];
    const params = new URLSearchParams(groupParams.concat(excludeParams));
    if (dto.amount) {
      params.set('amount', dto.amount.toString());
    }

    const url = `${this.baseRecommendationUrl}?${params.toString()}`;
    try {
      const data = await (await fetch(url)).json();
      const matchGroup = plainToInstance(MatchGroup, data);
      const errors = await validate(matchGroup);

      if (errors.length !== 0) {
        throw new AiBackendException();
      }
      const recommendationPublicationIds = matchGroup.matches.map((match) => match.id);

      if (!user) {
        console.log('recommendationPublicationIds: ', recommendationPublicationIds);
        const publications = await this.publicationRepository.find({ where: { id: In(recommendationPublicationIds) } });
        const recommendation = new Recommendation();
        recommendation.publications = publications;
        recommendation.createdAt = new Date();
        return recommendation;
      }

      const recommendationsAsObjects = recommendationPublicationIds.map((recommendationPublicationId) => ({
        id: recommendationPublicationId,
      }));
      return await this.recommendationRepository.save({
        user,
        publications: recommendationsAsObjects,
      });
    } catch (e) {
      throw new AiBackendException(`error when fetching ${url}`);
    }
  }
}
