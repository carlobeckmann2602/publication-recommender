import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from './publication/entities/publication.entity';
import { PublicationService } from './publication/services/publication.service';
import { PublicationResolver } from './publication/resolver/publication.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Publication])],
  providers: [PublicationService, PublicationResolver],
  controllers: [],
  exports: [TypeOrmModule],
})
export class CoreModule {}
