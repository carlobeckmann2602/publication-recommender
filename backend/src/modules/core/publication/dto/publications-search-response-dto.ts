import { Field, Float, ObjectType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PublicationResponseDto } from './publication-response.dto';

@ObjectType()
export class PublicationsSearchResponseDto {
  constructor(
    searchTerm: string,
    searchCoordinate: number[] | null,
    matchingPublications: PublicationResponseDto[],
    similarPublications: PublicationResponseDto[],
  ) {
    this.matchingPublications = matchingPublications;
    this.similarPublications = similarPublications;
    this.searchTerm = searchTerm;
    this.searchCoordinate = searchCoordinate;
  }

  @Field()
  @IsString()
  @IsNotEmpty()
  searchTerm: string;

  @Field(() => [Float], { nullable: true })
  @IsOptional()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  searchCoordinate?: number[] | null;

  @Field(() => [PublicationResponseDto])
  matchingPublications: PublicationResponseDto[];

  @Field(() => [PublicationResponseDto])
  similarPublications: PublicationResponseDto[];
}
