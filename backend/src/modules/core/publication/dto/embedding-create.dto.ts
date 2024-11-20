import { Field, Float, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';

@InputType()
export class EmbeddingCreateDto {
  @Field()
  text: string;

  @Field(() => [Float])
  @Transform(({ value }) => JSON.stringify(value))
  vector: string;
}
