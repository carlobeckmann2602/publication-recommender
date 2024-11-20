import { Field, ObjectType } from '@nestjs/graphql';
import { NearestNeighbor } from '../classes/nearestNeighbor';
import { PublicationResponseDto } from './publication-response.dto';

@ObjectType()
export class NearestNeighborsResponseDto {
  constructor(nearestNeighbor: NearestNeighbor) {
    this.publication = new PublicationResponseDto(nearestNeighbor.publication);
    this.distance = nearestNeighbor.distance;
    this.embeddingId = nearestNeighbor.embeddingId;
  }

  @Field()
  publication: PublicationResponseDto;

  @Field()
  distance: number;

  @Field()
  embeddingId: string;
}
