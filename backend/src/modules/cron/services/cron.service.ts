import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AiBackendException } from 'src/modules/core/publication/exceptions/ai-backend.exception';
import { RecommendationService } from 'src/modules/core/publication/services/recommendation.service';
import { LastChangedInfo } from '../dto/last-changed.dto';

@Injectable()
export class CronService {
  constructor(
    private configService: ConfigService,
    private recommendationService: RecommendationService,
  ) {}

  private readonly logger = new Logger(CronService.name);

  @Cron('0 0 0 * * 1')
  async buildAnnoyAndGenerateRecommendations() {
    try {
      this.logger.log('executing buildAnnoy');
      await this.buildAnnoy();
      this.logger.log('done with buildAnnoy');
      this.logger.log('executing generateRecommendations');
      await this.recommendationService.generateRecommendationsForAllUser();
      this.logger.log('done with generateRecommendations');
    } catch (e) {
      this.logger.log('error when executing buildAnnoyAndGenerateRecommendations: ', e);
    }
  }

  async buildAnnoy() {
    const lastChangedBeforeUpdate = await this.getLastChangedTimestampInMilliseconds();

    const buildAnnoyUrl = `${this.configService.get('PROJECT_AI_BACKEND_URL')}/build_annoy`;
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
}
