import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class RecommendationCreateDto {
  @Field(() => [String])
  group: string[];

  @Field(() => [String], { defaultValue: [] })
  exlude: string[];

  @Field(() => Int, { defaultValue: 10 })
  amount: number;
}
