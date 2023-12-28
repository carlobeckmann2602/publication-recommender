import { Field, ObjectType } from '@nestjs/graphql';
import { Recommendation } from '../entities/recommendation.entity';
import { PublicationResponseDto } from './publication-response.dto';

@ObjectType()
export class RecommendationResponseDto {
  constructor(recommendation: Recommendation) {
    this.id = recommendation.id;
    this.publications = recommendation.publications.map((publication) => new PublicationResponseDto(publication));
    this.createdAt = recommendation.createdAt;
  }

  @Field({ nullable: true })
  id: string | null;

  @Field(() => [PublicationResponseDto])
  publications: PublicationResponseDto[];

  @Field()
  createdAt: Date;
}
