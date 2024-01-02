import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../core/core.module';
import { Recommendation } from '../core/publication/entities/recommendation.entity';
import { User } from '../core/user/entities/user.entity';
import { CronService } from './services/cron.service';

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([User, Recommendation])],
  providers: [CronService],
})
export class CronModule {}
