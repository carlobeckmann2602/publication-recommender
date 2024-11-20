import { Field } from '@nestjs/graphql';
import { Publication } from '../entities/publication.entity';

export class NearestNeighbor {
  constructor(publication: Publication, distance: number, embeddingId: string) {
    this.publication = publication;
    this.distance = distance;
    this.embeddingId = embeddingId;
  }

  @Field()
  publication: Publication;

  @Field()
  distance: number;

  @Field()
  embeddingId: string;
}
