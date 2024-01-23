import { Field, Float, InputType } from '@nestjs/graphql';
import { ArrayMaxSize, ArrayMinSize } from 'class-validator';

@InputType()
export class SentenceDto {
  @Field()
  value: string;

  @Field(() => [Float])
  @ArrayMinSize(768)
  @ArrayMaxSize(768)
  vector: number[];
}
