import { ObjectType, PickType } from '@nestjs/graphql';
import { PublicationResponseDto } from './publication-response.dto';
import { PublicationsSearchResponseDto } from './publications-search-response-dto';

@ObjectType()
export class PublicationsSearchByIdResponseDto extends PickType(PublicationsSearchResponseDto, [
  'searchCoordinate',
  'similarPublications',
] as const) {
  constructor(searchCoordinate: number[] | null, similarPublications: PublicationResponseDto[]) {
    super();
    this.searchCoordinate = searchCoordinate;
    this.similarPublications = similarPublications;
  }
}
