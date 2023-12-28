import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { Recommendation } from '../../core/publication/entities/recommendation.entity';
import { AiBackendException } from '../../core/publication/exceptions/ai-backend.exception';
import { User } from '../../core/user/entities/user.entity';
import { LastChangedInfo } from '../dto/last-changed.dto';
import { MatchGroup } from '../dto/match-group.dto';

@Injectable()
export class CronService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
  ) {}

  private readonly logger = new Logger(CronService.name);

  @Cron('0 0 0 * * 1')
  async buildAnnoyAndGenerateRecommendations() {
    try {
      this.logger.log('executing buildAnnoy');
      await this.buildAnnoy();
      this.logger.log('done with buildAnnoy');
      this.logger.log('executing generateRecommendations');
      await this.generateRecommendations();
      this.logger.log('done with generateRecommendations');
    } catch (e) {
      this.logger.log('error when executing buildAnnoyAndGenerateRecommendations: ', e);
    }
  }

  async buildAnnoy() {
    const buildAnnoyUrl = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/build_annoy`;

    const lastChangedBeforeUpdate = await this.getLastChangedTimestampInMilliseconds();

    await fetch(buildAnnoyUrl);
    await new Promise<void>((resolve, reject) => {
      let retryCounter = 0;
      const maxRetryAttempts = 20;

      const intervall = setInterval(async () => {
        retryCounter++;
        const lastChanged = await this.getLastChangedTimestampInMilliseconds();

        if (lastChanged > lastChangedBeforeUpdate) {
          clearInterval(intervall);
          resolve();
        }

        if (retryCounter === maxRetryAttempts) {
          this.logger.log('could not update annoy');
          clearInterval(intervall);
          reject(new AiBackendException());
        }
      }, 2000);
    });
  }

  async getLastChangedTimestampInMilliseconds(): Promise<number> {
    const url = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/last_changed`;
    const data = await (await fetch(url)).json();
    const lastChangedInfo = plainToInstance(LastChangedInfo, data);
    const errors = await validate(lastChangedInfo);

    if (errors.length > 0) {
      throw new AiBackendException();
    }

    return lastChangedInfo.lastChanged * 1000;
  }

  async generateRecommendations() {
    const baseUrl = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/match_group`;

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

      const url = `${baseUrl}?${params.toString()}`;
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
}
