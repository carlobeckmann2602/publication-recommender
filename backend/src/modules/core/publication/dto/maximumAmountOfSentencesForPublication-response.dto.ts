import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

@ObjectType()
export class MaximumAmountOfSentencesForPublicationResponseDto {
  @Field(() => Int)
  @IsInt()
  @Transform(({ value }) => Number(value))
  amount: number;
}
