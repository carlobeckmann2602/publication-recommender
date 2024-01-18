import { Field, InputType, Int } from '@nestjs/graphql';
import { SearchStrategyVo } from '../vo/searchStrategy.vo';

@InputType()
export default class PublicationsSearchDto {
  @Field()
  searchInput: string;

  @Field(() => SearchStrategyVo)
  searchStrategy: SearchStrategyVo;

  @Field(() => Int, { defaultValue: 0 })
  page: number;

  @Field(() => Int, { defaultValue: 5 })
  amountPerPage: number;
}
