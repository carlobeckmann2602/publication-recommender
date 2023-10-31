import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publication } from './publication/entities/publication.entity';
import { PublicationResolver } from './publication/resolver/publication.resolver';
import { PublicationService } from './publication/services/publication.service';

@Module({
  imports: [TypeOrmModule.forFeature([Publication])],
  providers: [PublicationService, PublicationResolver],
  controllers: [],
  exports: [TypeOrmModule],
})
export class CoreModule {}
