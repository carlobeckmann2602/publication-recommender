import { Field, ObjectType } from '@nestjs/graphql';
import { Recommendation } from '../entities/recommendation.entity';
import { PublicationResponseDto } from './publication-response.dto';

@ObjectType()
export class RecommendationResponseDto {
  constructor(recommendation: Recommendation) {
    this.id = recommendation.id;
    this.publications = Array.isArray(recommendation.publications)
      ? recommendation.publications.map((publication) => new PublicationResponseDto(publication))
      : [];
    this.createdAt = recommendation.createdAt ? recommendation.createdAt.toISOString() : null;
  }

  @Field()
  id: string;

  @Field(() => [PublicationResponseDto])
  publications: PublicationResponseDto[];

  @Field()
  createdAt: string;
}
