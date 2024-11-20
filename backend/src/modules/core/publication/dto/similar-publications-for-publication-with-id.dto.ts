import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SearchFilters } from '../classes/searchFilters';
import { SortStrategyVo } from '../vo/sortStrategy.vo';

@InputType()
export default class SimilarPublicationsForPublicationWithIdDto {
  @Field()
  id: string;

  @Field(() => SortStrategyVo, { defaultValue: SortStrategyVo.RELEVANCE })
  sortStrategy: SortStrategyVo;

  @Field(() => Int, { defaultValue: 0 })
  page: number;

  @Field(() => Int, { defaultValue: 5 })
  amountPerPage: number;

  @Field(() => SearchFilters, { nullable: true })
  @IsOptional()
  filters?: SearchFilters;
}
