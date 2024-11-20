import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { SearchFilters } from '../classes/searchFilters';
import { SortStrategyVo } from '../vo/sortStrategy.vo';

@InputType()
export default class PublicationsSearchDto {
  @Field()
  searchInput: string;

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
