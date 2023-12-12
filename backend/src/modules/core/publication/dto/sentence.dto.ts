import { Field, Float, InputType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@InputType()
export class SentenceDto {
  @Field()
  @Expose()
  value: string;

  @Field(() => [Float])
  @Expose()
  vector: number[];
}
