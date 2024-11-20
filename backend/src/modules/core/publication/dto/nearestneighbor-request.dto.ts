import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class NearestNeighborRequestDto {
  @Field(() => [Float])
  vector: number[];

  @Field(() => Int)
  amount: number;
}
