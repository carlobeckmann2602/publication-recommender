import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class RecommendationCreateDto {
  @Field(() => [String])
  group: string[];

  @Field(() => [String], { nullable: true })
  exlude?: string[] | null;

  @Field(() => Int, { nullable: true })
  amount?: number | null;
}
